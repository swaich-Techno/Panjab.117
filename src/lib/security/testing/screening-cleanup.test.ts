import { describe, expect, it } from "vitest";

import { ScreeningKeyRing } from "@/lib/survey/duplicate-screening";
import {
  productionScreeningRetentionPolicyDraft,
  syntheticScreeningRetentionPolicy,
} from "@/lib/survey/screening-retention";

import {
  InMemoryScreeningCleanupStore,
  runBoundedSyntheticScreeningCleanup,
} from "./screening-cleanup";

const now = new Date("2026-12-05T00:00:00.000Z");

describe("Step 5D screening cleanup and rotation", () => {
  it("deletes only expired claims in a bounded batch and records policy evidence", async () => {
    const store = new InMemoryScreeningCleanupStore([
      {
        claimId: "claim-expired-01",
        domain: "idempotency",
        windowEnd: "2026-12-01T00:00:00.000Z",
      },
      {
        claimId: "claim-live-01",
        domain: "answer_duplicate",
        windowEnd: "2026-12-10T00:00:00.000Z",
      },
    ]);
    const evidence = await runBoundedSyntheticScreeningCleanup({
      policy: syntheticScreeningRetentionPolicy,
      store,
      now,
      limit: 1,
      createCleanupId: () => "00000000-0000-4000-8000-000000000801",
    });
    expect(evidence).toMatchObject({
      deletedClaimCount: 1,
      policyId: syntheticScreeningRetentionPolicy.policyId,
      policyVersion: syntheticScreeningRetentionPolicy.version,
      syntheticOnly: true,
    });
    expect(evidence.policySha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(store.snapshot()).toMatchObject({
      claims: [{ claimId: "claim-live-01" }],
      liveWithdrawalRecordCount: 1,
      evidence: [{ cleanupId: evidence.cleanupId }],
    });
  });

  it("refuses the unapproved production policy", async () => {
    await expect(
      runBoundedSyntheticScreeningCleanup({
        policy: productionScreeningRetentionPolicyDraft,
        store: new InMemoryScreeningCleanupStore([]),
        now,
      }),
    ).rejects.toThrow("not authorized");
  });

  it("derives old and new signals during rotation without exposing keys", () => {
    const oldKey = Buffer.alloc(32, 81);
    const newKey = Buffer.alloc(32, 82);
    const rotated = new ScreeningKeyRing([
      {
        id: "screen-v1",
        key: oldKey,
        status: "retained_for_duplicate_window",
      },
      { id: "screen-v2", key: newKey, status: "active" },
    ]).deriveAll("idempotency", ["questionnaire-v1", "retry-token"]);
    expect(rotated.map(({ keyId }) => keyId)).toEqual([
      "screen-v1",
      "screen-v2",
    ]);
    expect(rotated[0]?.value).not.toBe(rotated[1]?.value);
    expect(JSON.stringify(rotated)).not.toContain(oldKey.toString("hex"));
    expect(JSON.stringify(rotated)).not.toContain(newKey.toString("hex"));
  });
});
