export type SafeAuditOutboxEvent = {
  eventId: string;
  dedupeKey: string;
  responseId: string | null;
  eventType:
    "intake_committed" | "screening_cleanup_completed" | "withdrawal_completed";
  outcome:
    | "response_accepted_and_stored"
    | "response_retained_for_duplicate_review"
    | "screening_cleanup_completed"
    | "withdrawal_completed";
  state: "pending" | "leased" | "delivered" | "dead_letter";
  attemptCount: number;
  maxAttempts: number;
  availableAt: string;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  deliveredAt: string | null;
  lastErrorCode: "delivery_failed" | null;
};

export interface AuditOutboxStore {
  leaseBatch(input: {
    workerId: string;
    now: Date;
    limit: number;
    leaseMs: number;
  }): Promise<readonly SafeAuditOutboxEvent[]>;
  markDelivered(
    eventId: string,
    workerId: string,
    deliveredAt: Date,
  ): Promise<void>;
  markDeliveryFailed(input: {
    eventId: string;
    workerId: string;
    failedAt: Date;
    retryDelayMs: number;
  }): Promise<{ deadLettered: boolean }>;
}

export interface IdempotentAuditSink {
  deliver(
    event: Readonly<
      Pick<
        SafeAuditOutboxEvent,
        "eventId" | "dedupeKey" | "responseId" | "eventType" | "outcome"
      >
    >,
  ): Promise<"delivered" | "already_delivered">;
}

function validDate(value: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error("Invalid outbox timestamp");
  return parsed;
}

function cloneEvent(event: SafeAuditOutboxEvent): SafeAuditOutboxEvent {
  return { ...event };
}

export class InMemoryDurableAuditOutbox implements AuditOutboxStore {
  readonly #events = new Map<string, SafeAuditOutboxEvent>();
  readonly #dedupeKeys = new Set<string>();

  enqueue(
    event: Omit<
      SafeAuditOutboxEvent,
      | "state"
      | "attemptCount"
      | "leaseOwner"
      | "leaseExpiresAt"
      | "deliveredAt"
      | "lastErrorCode"
    >,
  ): void {
    if (
      this.#events.has(event.eventId) ||
      this.#dedupeKeys.has(event.dedupeKey)
    ) {
      throw new Error("Outbox event or dedupe key already exists");
    }
    if (!Number.isInteger(event.maxAttempts) || event.maxAttempts < 1) {
      throw new Error("Outbox maxAttempts must be a positive integer");
    }
    validDate(event.availableAt);
    this.#events.set(event.eventId, {
      ...event,
      state: "pending",
      attemptCount: 0,
      leaseOwner: null,
      leaseExpiresAt: null,
      deliveredAt: null,
      lastErrorCode: null,
    });
    this.#dedupeKeys.add(event.dedupeKey);
  }

  async leaseBatch(input: {
    workerId: string;
    now: Date;
    limit: number;
    leaseMs: number;
  }): Promise<readonly SafeAuditOutboxEvent[]> {
    if (
      !/^[A-Za-z0-9_-]{8,96}$/u.test(input.workerId) ||
      !Number.isInteger(input.limit) ||
      input.limit < 1 ||
      input.limit > 100 ||
      !Number.isInteger(input.leaseMs) ||
      input.leaseMs < 1_000 ||
      !Number.isFinite(input.now.getTime())
    ) {
      throw new Error("Invalid outbox lease request");
    }
    const nowMs = input.now.getTime();
    for (const event of this.#events.values()) {
      if (
        event.state === "leased" &&
        event.leaseExpiresAt !== null &&
        validDate(event.leaseExpiresAt) <= nowMs
      ) {
        event.state = "pending";
        event.leaseOwner = null;
        event.leaseExpiresAt = null;
      }
    }
    const candidates = [...this.#events.values()]
      .filter(
        (event) =>
          event.state === "pending" && validDate(event.availableAt) <= nowMs,
      )
      .sort((left, right) => left.eventId.localeCompare(right.eventId))
      .slice(0, input.limit);
    for (const event of candidates) {
      event.state = "leased";
      event.attemptCount += 1;
      event.leaseOwner = input.workerId;
      event.leaseExpiresAt = new Date(nowMs + input.leaseMs).toISOString();
    }
    return candidates.map(cloneEvent);
  }

  async markDelivered(
    eventId: string,
    workerId: string,
    deliveredAt: Date,
  ): Promise<void> {
    const event = this.#events.get(eventId);
    if (
      !event ||
      event.state !== "leased" ||
      event.leaseOwner !== workerId ||
      !Number.isFinite(deliveredAt.getTime())
    ) {
      throw new Error("Outbox lease ownership mismatch");
    }
    event.state = "delivered";
    event.deliveredAt = deliveredAt.toISOString();
    event.leaseOwner = null;
    event.leaseExpiresAt = null;
    event.lastErrorCode = null;
  }

  async markDeliveryFailed(input: {
    eventId: string;
    workerId: string;
    failedAt: Date;
    retryDelayMs: number;
  }): Promise<{ deadLettered: boolean }> {
    const event = this.#events.get(input.eventId);
    if (
      !event ||
      event.state !== "leased" ||
      event.leaseOwner !== input.workerId ||
      !Number.isFinite(input.failedAt.getTime()) ||
      !Number.isInteger(input.retryDelayMs) ||
      input.retryDelayMs < 0
    ) {
      throw new Error("Outbox lease ownership mismatch");
    }
    const deadLettered = event.attemptCount >= event.maxAttempts;
    event.state = deadLettered ? "dead_letter" : "pending";
    event.availableAt = new Date(
      input.failedAt.getTime() + input.retryDelayMs,
    ).toISOString();
    event.leaseOwner = null;
    event.leaseExpiresAt = null;
    event.lastErrorCode = "delivery_failed";
    return { deadLettered };
  }

  snapshot(): readonly SafeAuditOutboxEvent[] {
    return [...this.#events.values()].map(cloneEvent);
  }
}

export class InMemoryIdempotentAuditSink implements IdempotentAuditSink {
  readonly #delivered = new Set<string>();
  deliveryCalls = 0;

  async deliver(
    event: Readonly<
      Pick<
        SafeAuditOutboxEvent,
        "eventId" | "dedupeKey" | "responseId" | "eventType" | "outcome"
      >
    >,
  ): Promise<"delivered" | "already_delivered"> {
    this.deliveryCalls += 1;
    if (this.#delivered.has(event.dedupeKey)) return "already_delivered";
    this.#delivered.add(event.dedupeKey);
    return "delivered";
  }

  deliveredCount(): number {
    return this.#delivered.size;
  }
}

export class SimulatedOutboxProcessorCrash extends Error {
  constructor() {
    super("Simulated crash after delivery and before acknowledgement");
    this.name = "SimulatedOutboxProcessorCrash";
  }
}

export async function processAuditOutboxBatch(input: {
  store: AuditOutboxStore;
  sink: IdempotentAuditSink;
  workerId: string;
  now: Date;
  limit?: number;
  leaseMs?: number;
  retryDelayMs?: number;
  onDeadLetter?: (eventId: string) => void;
  afterDeliveryBeforeAckForTest?: (eventId: string) => void;
}): Promise<{ delivered: number; failed: number; deadLettered: number }> {
  const leased = await input.store.leaseBatch({
    workerId: input.workerId,
    now: input.now,
    limit: input.limit ?? 25,
    leaseMs: input.leaseMs ?? 30_000,
  });
  const result = { delivered: 0, failed: 0, deadLettered: 0 };
  for (const event of leased) {
    try {
      await input.sink.deliver({
        eventId: event.eventId,
        dedupeKey: event.dedupeKey,
        responseId: event.responseId,
        eventType: event.eventType,
        outcome: event.outcome,
      });
      input.afterDeliveryBeforeAckForTest?.(event.eventId);
      await input.store.markDelivered(event.eventId, input.workerId, input.now);
      result.delivered += 1;
    } catch (error) {
      if (error instanceof SimulatedOutboxProcessorCrash) {
        throw error;
      }
      const failure = await input.store.markDeliveryFailed({
        eventId: event.eventId,
        workerId: input.workerId,
        failedAt: input.now,
        retryDelayMs: input.retryDelayMs ?? 1_000,
      });
      result.failed += 1;
      if (failure.deadLettered) {
        result.deadLettered += 1;
        input.onDeadLetter?.(event.eventId);
      }
    }
  }
  return result;
}
