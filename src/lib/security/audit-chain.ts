import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export interface AuditEventInput {
  id: string;
  occurredAt: string;
  action: string;
  outcome: "success" | "denied" | "failed";
  actorId?: string;
  targetId?: string;
}

export interface ChainedAuditEvent extends AuditEventInput {
  sequence: number;
  previousHash: string | null;
  eventHash: string;
}

export interface AuditCheckpoint {
  formatVersion: 1;
  fromSequence: number;
  toSequence: number;
  eventCount: number;
  terminalEventHash: string;
  createdAt: string;
  anchorKeyId: string;
  anchorDigest: string;
}

function canonicalEvent(
  input: AuditEventInput,
  sequence: number,
  previousHash: string | null,
): string {
  return JSON.stringify({
    action: input.action,
    actorId: input.actorId ?? null,
    id: input.id,
    occurredAt: input.occurredAt,
    outcome: input.outcome,
    previousHash,
    sequence,
    targetId: input.targetId ?? null,
  });
}

function canonicalCheckpoint(
  checkpoint: Omit<AuditCheckpoint, "anchorDigest">,
): string {
  return JSON.stringify(checkpoint);
}

export function appendAuditEvent(
  events: readonly ChainedAuditEvent[],
  input: AuditEventInput,
): ChainedAuditEvent {
  const previous = events.at(-1);
  const sequence = (previous?.sequence ?? 0) + 1;
  const previousHash = previous?.eventHash ?? null;

  return {
    ...input,
    sequence,
    previousHash,
    eventHash: createHash("sha256")
      .update(canonicalEvent(input, sequence, previousHash))
      .digest("base64url"),
  };
}

export function verifyAuditChain(
  events: readonly ChainedAuditEvent[],
): boolean {
  let previousHash: string | null = null;

  return events.every((event, index) => {
    const expectedSequence = index + 1;
    const expected = createHash("sha256")
      .update(canonicalEvent(event, expectedSequence, previousHash))
      .digest("base64url");
    const valid =
      event.sequence === expectedSequence &&
      event.previousHash === previousHash &&
      event.eventHash === expected;
    previousHash = event.eventHash;
    return valid;
  });
}

export function createAuditCheckpoint(
  events: readonly ChainedAuditEvent[],
  input: { createdAt: string; anchorKeyId: string; anchorKey: Buffer },
): AuditCheckpoint {
  if (events.length === 0 || !verifyAuditChain(events)) {
    throw new Error("Cannot checkpoint an empty or invalid audit chain");
  }

  const base: Omit<AuditCheckpoint, "anchorDigest"> = {
    formatVersion: 1,
    fromSequence: events[0]!.sequence,
    toSequence: events.at(-1)!.sequence,
    eventCount: events.length,
    terminalEventHash: events.at(-1)!.eventHash,
    createdAt: input.createdAt,
    anchorKeyId: input.anchorKeyId,
  };

  return {
    ...base,
    anchorDigest: createHmac("sha256", input.anchorKey)
      .update(canonicalCheckpoint(base))
      .digest("base64url"),
  };
}

export function verifyAuditCheckpoint(
  checkpoint: AuditCheckpoint,
  anchorKey: Buffer,
): boolean {
  const { anchorDigest, ...base } = checkpoint;
  const expected = createHmac("sha256", anchorKey)
    .update(canonicalCheckpoint(base))
    .digest();
  const supplied = Buffer.from(anchorDigest, "base64url");

  return (
    supplied.length === expected.length && timingSafeEqual(expected, supplied)
  );
}
