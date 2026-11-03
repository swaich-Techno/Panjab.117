import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  appendAuditEvent,
  createAuditCheckpoint,
  verifyAuditChain,
  verifyAuditCheckpoint,
  type ChainedAuditEvent,
} from "./audit-chain";

describe("audit chain and separately held checkpoint proof", () => {
  it("detects changed events and checkpoint anchors", () => {
    const anchorKey = Buffer.alloc(32, 0x77);
    const first = appendAuditEvent([], {
      id: "event-001",
      occurredAt: "2026-11-03T12:00:00.000Z",
      action: "synthetic.create",
      outcome: "success",
    });
    const second = appendAuditEvent([first], {
      id: "event-002",
      occurredAt: "2026-11-03T12:00:01.000Z",
      action: "synthetic.deny",
      outcome: "denied",
    });
    const events = [first, second];
    const checkpoint = createAuditCheckpoint(events, {
      createdAt: "2026-11-03T12:00:02.000Z",
      anchorKeyId: "memory://audit-anchor/v1",
      anchorKey,
    });
    const anchorDirectory = mkdtempSync(
      path.join(tmpdir(), "panjab117-audit-anchor-"),
    );
    const anchorPath = path.join(anchorDirectory, "checkpoint.json");

    try {
      writeFileSync(anchorPath, JSON.stringify(checkpoint), {
        encoding: "utf8",
        flag: "wx",
      });
      const separatelyReadCheckpoint = JSON.parse(
        readFileSync(anchorPath, "utf8"),
      ) as typeof checkpoint;

      expect(verifyAuditChain(events)).toBe(true);
      expect(verifyAuditCheckpoint(separatelyReadCheckpoint, anchorKey)).toBe(
        true,
      );
      expect(
        verifyAuditChain([
          first,
          { ...second, outcome: "success" } as ChainedAuditEvent,
        ]),
      ).toBe(false);
      expect(
        verifyAuditCheckpoint(
          { ...checkpoint, terminalEventHash: "changed" },
          anchorKey,
        ),
      ).toBe(false);
    } finally {
      rmSync(anchorDirectory, { force: true, recursive: true });
    }
  });
});
