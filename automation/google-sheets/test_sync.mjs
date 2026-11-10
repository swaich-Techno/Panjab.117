import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const code = fs.readFileSync(new URL("./Code.gs", import.meta.url), "utf8");
new vm.Script(code);

assert(!/\bfunction\s+(?:doPost|doGet)\b/.test(code), "No public web handler");
assert(
  !/1joa94GiuZ|1pPdUFylX|1NZqXBDy27|1Jo4DDExX|1eJZP2hcVV/.test(code),
  "No private spreadsheet IDs embedded",
);
assert(
  !/Intake_Staging|Consent_Operations|response_token_hash/.test(code),
  "No response-level reads",
);

const aggregateHeaders = [
  "survey_round_id",
  "assembly_constituency_number",
  "metric_id",
  "option_id",
  "approved_count",
  "eligible_sample_count",
  "reporting_date_ist",
  "questionnaire_version",
  "source_batch_id",
  "last_verified_at",
];
const approvalHeaders = [
  "source_batch_id",
  "survey_round_id",
  "assembly_constituency_number",
  "approval_status",
  "reviewer",
  "reviewed_at_ist",
  "approval_note",
];

class Range {
  constructor(sheet, row, column, height, width) {
    Object.assign(this, { sheet, row, column, height, width });
  }
  getValues() {
    return Array.from({ length: this.height }, (_row, y) =>
      Array.from(
        { length: this.width },
        (_column, x) =>
          this.sheet.rows[this.row - 1 + y]?.[this.column - 1 + x] ?? "",
      ),
    );
  }
  setValues(values) {
    assert.equal(values.length, this.height);
    this.sheet.writeCount++;
    values.forEach((inputRow, y) => {
      assert.equal(inputRow.length, this.width);
      const targetRow = this.row - 1 + y;
      while (this.sheet.rows.length <= targetRow) this.sheet.rows.push([]);
      inputRow.forEach((value, x) => {
        this.sheet.rows[targetRow][this.column - 1 + x] = value;
      });
    });
    return this;
  }
}

class Sheet {
  constructor(name, rows = []) {
    this.name = name;
    this.rows = rows.map((row) => [...row]);
    this.writeCount = 0;
    this.frozen = 0;
  }
  getName() {
    return this.name;
  }
  getLastRow() {
    for (let index = this.rows.length - 1; index >= 0; index--) {
      if (this.rows[index].some((value) => value !== "" && value != null))
        return index + 1;
    }
    return 0;
  }
  getRange(row, column, height, width) {
    return new Range(this, row, column, height, width);
  }
  setFrozenRows(count) {
    this.frozen = count;
  }
  appendRow(row) {
    this.rows.push([...row]);
    this.writeCount++;
  }
}

class Workbook {
  constructor(sheets) {
    this.sheets = new Map(sheets.map((sheet) => [sheet.name, sheet]));
  }
  getSheetByName(name) {
    return this.sheets.get(name) || null;
  }
  insertSheet(name) {
    const sheet = new Sheet(name);
    this.sheets.set(name, sheet);
    return sheet;
  }
}

const ids = ["MASTER", "PRE1", "PRE2", "PRE3", "EXIT"];
const books = new Map();
for (const id of ids) {
  const sheets =
    id === "MASTER"
      ? [
          new Sheet("Approved_Aggregates", [
            aggregateHeaders,
            [
              "PRE1",
              54,
              "synthetic_sync_probe",
              "not_applicable",
              0,
              0,
              "2026-11-10",
              "synthetic-v1",
              "SYNTHETIC-PRE1-DEMO-001",
              "2026-11-10T00:00:00+05:30",
            ],
          ]),
        ]
      : [
          new Sheet("Constituency_Summary_117", [aggregateHeaders]),
          new Sheet("Aggregate_Approvals", [approvalHeaders]),
        ];
  books.set(id, new Workbook(sheets));
}

const properties = new Map([
  ["PANJAB117_MASTER_SHEET_ID", "MASTER"],
  ...["PRE1", "PRE2", "PRE3", "EXIT"].map((round) => [
    `PANJAB117_${round}_SHEET_ID`,
    round,
  ]),
  ["PANJAB117_SYNC_ENABLED", "false"],
]);
const sharing = new Map(ids.map((id) => [id, "PRIVATE"]));
const logs = [];
const errors = [];
const triggers = [];
const context = {
  Date,
  Error,
  JSON,
  Map,
  Number,
  Object,
  Set,
  String,
  console: {
    error: (message) => errors.push(message),
    log: (message) => logs.push(message),
  },
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (key) => properties.get(key),
      setProperty: (key, value) => properties.set(key, value),
    }),
  },
  SpreadsheetApp: {
    openById: (id) => {
      assert(books.has(id));
      return books.get(id);
    },
  },
  DriveApp: {
    Access: { PRIVATE: "PRIVATE" },
    getFileById: (id) => ({ getSharingAccess: () => sharing.get(id) }),
  },
  LockService: {
    getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }),
  },
  Utilities: {
    formatDate: (date, _timezone, pattern) =>
      pattern === "yyyy-MM-dd"
        ? date.toISOString().slice(0, 10)
        : "2026-11-10T12:00:00",
  },
  ScriptApp: {
    getProjectTriggers: () => triggers,
    newTrigger: (name) => ({
      timeBased: () => ({
        everyHours: () => ({
          create: () => triggers.push({ getHandlerFunction: () => name }),
        }),
      }),
    }),
    deleteTrigger: (trigger) => triggers.splice(triggers.indexOf(trigger), 1),
  },
};
vm.createContext(context);
vm.runInContext(code, context);

const sheet = (book, name) => books.get(book).getSheetByName(name);
const summary = sheet("PRE1", "Constituency_Summary_117");
const approvals = sheet("PRE1", "Aggregate_Approvals");
const master = sheet("MASTER", "Approved_Aggregates");

const initialDryRun = context.dryRunAggregateSync();
assert.equal(initialDryRun.approvedAggregateRows, 0);
assert.equal(initialDryRun.newRows, 0);
assert.equal(initialDryRun.rejectedOrSyntheticRows, 0);
assert.throws(() => context.syncApprovedAggregates(), /not activated/);

summary.rows.push([
  "PRE1",
  58,
  "valid_response_total",
  "all",
  73,
  73,
  "2026-11-10",
  "survey-v1",
  "BATCH-0001",
  "2026-11-10T10:00:00+05:30",
]);
assert.equal(
  context.dryRunAggregateSync().approvedAggregateRows,
  0,
  "Unapproved rows stay blocked",
);

approvals.rows.push([
  "BATCH-0001",
  "PRE1",
  58,
  "APPROVED",
  "synthetic-reviewer",
  "2026-11-10",
  "Synthetic fixture only",
]);
assert.equal(context.dryRunAggregateSync().approvedAggregateRows, 1);
properties.set("PANJAB117_SYNC_ENABLED", "true");
assert.equal(context.syncApprovedAggregates().newRows, 1);
assert.equal(
  master.getLastRow(),
  3,
  "Header, preserved synthetic probe, and approved aggregate",
);
assert.equal(
  context.syncApprovedAggregates().newRows,
  0,
  "Idempotent retry does not duplicate",
);
assert.equal(master.getLastRow(), 3);

summary.rows[1][4] = 75;
summary.rows[1][5] = 75;
assert.equal(
  context.syncApprovedAggregates().updatedRows,
  1,
  "Correction updates the retained row",
);
assert.equal(master.rows.find((row) => row[8] === "BATCH-0001")[4], 75);

approvals.rows[1][3] = "REVOKED";
const revoked = context.syncApprovedAggregates();
assert.equal(revoked.removedRows, 1, "Revocation removes stale master data");
assert(!master.rows.some((row) => row[8] === "BATCH-0001"));
assert(master.rows.some((row) => row[8] === "SYNTHETIC-PRE1-DEMO-001"));

approvals.rows[1][3] = "APPROVED";
assert.equal(
  context.syncApprovedAggregates().newRows,
  1,
  "Reapproval is restart-safe",
);

const exitSummary = sheet("EXIT", "Constituency_Summary_117");
const exitApprovals = sheet("EXIT", "Aggregate_Approvals");
exitSummary.rows.push([
  "EXIT",
  58,
  "valid_response_total",
  "all",
  90,
  90,
  "2026-11-10",
  "survey-v1",
  "BATCH-EXIT-01",
  "2026-11-10T10:00:00+05:30",
]);
exitApprovals.rows.push([
  "BATCH-EXIT-01",
  "EXIT",
  58,
  "APPROVED",
  "synthetic-reviewer",
  "2026-11-10",
  "EXIT remains held",
]);
assert.equal(
  context.dryRunAggregateSync().approvedAggregateRows,
  1,
  "EXIT is isolated",
);

sharing.set("PRE2", "ANYONE");
assert.throws(() => context.dryRunAggregateSync(), /Public sharing/);
sharing.set("PRE2", "PRIVATE");

const pre2Summary = sheet("PRE2", "Constituency_Summary_117");
pre2Summary.rows.push([
  "PRE3",
  54,
  "valid_response_total",
  "all",
  1,
  1,
  "2026-11-10",
  "survey-v1",
  "BAD-ROUND",
  "2026-11-10T10:00:00+05:30",
]);
assert.throws(() => context.syncApprovedAggregates(), /Cross-round aggregate/);
assert.equal(sheet("MASTER", "Sync_Audit").rows.at(-1)[2], "FAILURE");
pre2Summary.rows.pop();

approvals.rows.push([
  "BATCH-0001",
  "PRE1",
  58,
  "APPROVED",
  "second-reviewer",
  "2026-11-10",
  "Duplicate key fixture",
]);
assert.throws(() => context.dryRunAggregateSync(), /Duplicate approval/);
approvals.rows.pop();

assert.equal(
  context.installHourlyAggregateTrigger().hourlyAggregateTriggerCreated,
  true,
);
assert.equal(context.installHourlyAggregateTrigger().existingTrigger, true);
assert.equal(triggers.length, 1);
assert.equal(
  context.disableAggregateSynchronization().scheduledAggregateSyncDisabled,
  true,
);
assert.equal(properties.get("PANJAB117_SYNC_ENABLED"), "false");
assert.equal(triggers.length, 0);
assert.throws(() => context.syncApprovedAggregates(), /not activated/);

console.log(
  "PASS: fail-closed sharing, approval gate, synthetic exclusion, deterministic retry, correction, revocation reconciliation, EXIT isolation, failure audit, trigger uniqueness and emergency stop.",
);
