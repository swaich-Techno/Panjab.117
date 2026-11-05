import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  mysqlRegistrationTransactionPlan,
  mysqlWithdrawalTransactionPlan,
} from "./mysql-transaction-plan";

describe("MySQL registration transaction design", () => {
  it("locks approval, capacity and withdrawal state transactionally", () => {
    expect(mysqlRegistrationTransactionPlan.begin).toBe("START TRANSACTION");
    expect(mysqlRegistrationTransactionPlan.lockApprovals).toContain(
      "FOR UPDATE",
    );
    expect(mysqlRegistrationTransactionPlan.lockCapacity).toContain(
      "FOR UPDATE",
    );
    expect(mysqlRegistrationTransactionPlan.incrementCapacity).toContain(
      "confirmed_count < capacity_limit",
    );
    expect(mysqlWithdrawalTransactionPlan.lockRegistration).toContain(
      "FOR UPDATE",
    );
    expect(mysqlWithdrawalTransactionPlan.releaseCapacity).toContain(
      "confirmed_count > 0",
    );
  });

  it("defines unique duplicate/idempotency guards and false launch gates", () => {
    const migration = readFileSync(
      resolve("database/migrations/0001_party_registration_pilot.sql"),
      "utf8",
    );
    expect(migration).toContain("uq_registration_idempotency");
    expect(migration).toContain("uq_registration_synthetic_participant");
    expect(migration).toContain("confirmed_count <= capacity_limit");
    expect(migration).toContain(
      "final_launch_approved BOOLEAN NOT NULL DEFAULT FALSE",
    );
    expect(migration).toContain(
      "emergency_stop_active BOOLEAN NOT NULL DEFAULT TRUE",
    );
    expect(migration).not.toMatch(/CREATE USER|GRANT ALL|DROP DATABASE/i);
  });
});
