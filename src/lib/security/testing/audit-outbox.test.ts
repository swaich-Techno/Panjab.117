import { describe, expect, it } from "vitest";

import {
  InMemoryDurableAuditOutbox,
  InMemoryIdempotentAuditSink,
  processAuditOutboxBatch,
  SimulatedOutboxProcessorCrash,
  type IdempotentAuditSink,
} from "./audit-outbox";

const now = new Date("2026-11-05T00:00:00.000Z");

function enqueue(outbox: InMemoryDurableAuditOutbox, maxAttempts = 3) {
  outbox.enqueue({
    eventId: "00000000-0000-4000-8000-000000000701",
    dedupeKey: "a".repeat(64),
    responseId: "00000000-0000-4000-8000-000000000501",
    eventType: "intake_committed",
    outcome: "response_accepted_and_stored",
    maxAttempts,
    availableAt: now.toISOString(),
  });
}

describe("Step 5D durable audit outbox", () => {
  it("delivers and acknowledges a safe event exactly once", async () => {
    const outbox = new InMemoryDurableAuditOutbox();
    const sink = new InMemoryIdempotentAuditSink();
    enqueue(outbox);

    await expect(
      processAuditOutboxBatch({
        store: outbox,
        sink,
        workerId: "worker-step5d-01",
        now,
      }),
    ).resolves.toEqual({ delivered: 1, failed: 0, deadLettered: 0 });
    expect(outbox.snapshot()[0]).toMatchObject({
      state: "delivered",
      attemptCount: 1,
      lastErrorCode: null,
    });
    expect(sink.deliveredCount()).toBe(1);
  });

  it("recovers after a crash following delivery without duplicating the sink record", async () => {
    const outbox = new InMemoryDurableAuditOutbox();
    const sink = new InMemoryIdempotentAuditSink();
    enqueue(outbox);
    await expect(
      processAuditOutboxBatch({
        store: outbox,
        sink,
        workerId: "worker-step5d-01",
        now,
        leaseMs: 1_000,
        afterDeliveryBeforeAckForTest: () => {
          throw new SimulatedOutboxProcessorCrash();
        },
      }),
    ).rejects.toThrow(SimulatedOutboxProcessorCrash);
    expect(outbox.snapshot()[0]?.state).toBe("leased");

    await expect(
      processAuditOutboxBatch({
        store: outbox,
        sink,
        workerId: "worker-step5d-02",
        now: new Date(now.getTime() + 1_001),
      }),
    ).resolves.toEqual({ delivered: 1, failed: 0, deadLettered: 0 });
    expect(sink.deliveryCalls).toBe(2);
    expect(sink.deliveredCount()).toBe(1);
    expect(outbox.snapshot()[0]?.state).toBe("delivered");
  });

  it("uses bounded retries and dead-letters persistent failures", async () => {
    const outbox = new InMemoryDurableAuditOutbox();
    const deadLetters: string[] = [];
    const failingSink: IdempotentAuditSink = {
      deliver: async () => {
        throw new Error("synthetic provider unavailable");
      },
    };
    enqueue(outbox, 2);
    await processAuditOutboxBatch({
      store: outbox,
      sink: failingSink,
      workerId: "worker-step5d-01",
      now,
      retryDelayMs: 1_000,
    });
    await processAuditOutboxBatch({
      store: outbox,
      sink: failingSink,
      workerId: "worker-step5d-02",
      now: new Date(now.getTime() + 1_001),
      onDeadLetter: (eventId) => deadLetters.push(eventId),
    });
    expect(outbox.snapshot()[0]).toMatchObject({
      state: "dead_letter",
      attemptCount: 2,
      lastErrorCode: "delivery_failed",
    });
    expect(deadLetters).toEqual(["00000000-0000-4000-8000-000000000701"]);
  });

  it("rejects duplicate enqueue and exposes no confidential payload fields", () => {
    const outbox = new InMemoryDurableAuditOutbox();
    enqueue(outbox);
    expect(() => enqueue(outbox)).toThrow("already exists");
    const serialized = JSON.stringify(outbox.snapshot());
    for (const forbidden of [
      "answers",
      "withdrawalCode",
      "csrf",
      "cookie",
      "authorization",
      "screeningSignal",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("does not mutate an event when the store connection fails before leasing", async () => {
    const outbox = new InMemoryDurableAuditOutbox();
    enqueue(outbox);
    await expect(
      processAuditOutboxBatch({
        store: {
          leaseBatch: async () => {
            throw new Error("synthetic database connection lost");
          },
          markDelivered: async () => undefined,
          markDeliveryFailed: async () => ({ deadLettered: false }),
        },
        sink: new InMemoryIdempotentAuditSink(),
        workerId: "worker-step5d-01",
        now,
      }),
    ).rejects.toThrow("connection lost");
    expect(outbox.snapshot()[0]).toMatchObject({
      state: "pending",
      attemptCount: 0,
    });
  });
});
