/**
 * PANJAB 117 private aggregate-only synchronization.
 *
 * This project has no doGet/doPost endpoint and never reads response-level
 * tabs. Spreadsheet IDs belong in owner-controlled Script Properties only.
 */
const P117 = Object.freeze({
  ROUND_IDS: Object.freeze(["PRE1", "PRE2", "PRE3", "EXIT"]),
  ROW_CAP: 5000,
  TIMESTAMP_TIMEZONE: "Asia/Kolkata",
  ENABLE_KEY: "PANJAB117_SYNC_ENABLED",
  HEADERS: Object.freeze([
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
  ]),
  APPROVAL_HEADERS: Object.freeze([
    "source_batch_id",
    "survey_round_id",
    "assembly_constituency_number",
    "approval_status",
    "reviewer",
    "reviewed_at_ist",
    "approval_note",
  ]),
  AUDIT_HEADERS: Object.freeze([
    "checked_at_ist",
    "mode",
    "result",
    "eligible_aggregate_rows",
    "new_rows",
    "updated_rows",
    "removed_rows",
    "blocked_or_skipped_rows",
    "note",
  ]),
});

function p117Property_(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value || !String(value).trim()) {
    throw new Error("Missing Script Property: " + name);
  }
  return String(value).trim();
}

function p117Configuration_() {
  const master = p117Property_("PANJAB117_MASTER_SHEET_ID");
  const sources = [
    { round: "PRE1", id: p117Property_("PANJAB117_PRE1_SHEET_ID") },
    { round: "PRE2", id: p117Property_("PANJAB117_PRE2_SHEET_ID") },
    { round: "PRE3", id: p117Property_("PANJAB117_PRE3_SHEET_ID") },
    { round: "EXIT", id: p117Property_("PANJAB117_EXIT_SHEET_ID") },
  ];
  if (new Set([master].concat(sources.map((source) => source.id))).size !== 5) {
    throw new Error("Each of the five spreadsheet IDs must be distinct.");
  }
  return { master, sources };
}

function p117AuditSharing_(config) {
  [config.master].concat(config.sources.map((source) => source.id)).forEach((id, index) => {
    if (DriveApp.getFileById(id).getSharingAccess() !== DriveApp.Access.PRIVATE) {
      throw new Error("Public sharing detected on workbook index " + index + "; sync refused.");
    }
  });
}

function p117WorkbookSheet_(workbook, tab) {
  const sheet = workbook.getSheetByName(tab);
  if (!sheet) throw new Error("Required sheet is missing: " + tab);
  return sheet;
}

function p117AssertHeader_(sheet, expected) {
  const header = sheet.getRange(1, 1, 1, expected.length).getValues()[0];
  if (header.length !== expected.length || expected.some((name, index) => String(header[index]).trim() !== name)) {
    throw new Error("Unexpected columns in " + sheet.getName() + "; no import performed.");
  }
}

function p117Rows_(sheet, width) {
  const count = Math.max(0, sheet.getLastRow() - 1);
  if (count > P117.ROW_CAP) throw new Error("Review source row cap before sync: " + sheet.getName());
  return count === 0 ? [] : sheet.getRange(2, 1, count, width).getValues();
}

function p117IsoDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, P117.TIMESTAMP_TIMEZONE, "yyyy-MM-dd");
  }
  const text = String(value || "").trim();
  const parsed = new Date(text + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    throw new Error("Aggregate date must be a valid yyyy-mm-dd date.");
  }
  return text;
}

function p117SafeCode_(value, label) {
  const text = String(value || "").trim();
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{1,99}$/.test(text)) {
    throw new Error("Invalid aggregate " + label + " code.");
  }
  return text;
}

function p117RecordKey_(row) {
  return [row[0], row[1], row[2], row[3], row[6], row[8]].join("|");
}

function p117ApprovalKey_(round, seat, batch) {
  return [round, seat, batch].join("|");
}

function p117IsSynthetic_(row) {
  return String(row[2]) === "synthetic_sync_probe" || String(row[8]).startsWith("SYNTHETIC-");
}

function p117ValidateRow_(raw, expectedRound) {
  if (raw[0] !== expectedRound) throw new Error("Cross-round aggregate rejected.");
  const seat = Number(raw[1]);
  if (raw[4] === "" || raw[4] == null || raw[5] === "" || raw[5] == null) {
    throw new Error("Aggregate counts must not be blank.");
  }
  const count = Number(raw[4]);
  const eligible = Number(raw[5]);
  if (!Number.isInteger(seat) || seat < 1 || seat > 117) throw new Error("Invalid Assembly constituency.");
  if (!Number.isSafeInteger(count) || count < 0 || !Number.isSafeInteger(eligible) || eligible < count) {
    throw new Error("Approved count / eligible sample mismatch.");
  }
  const metric = p117SafeCode_(raw[2], "metric");
  const option = p117SafeCode_(raw[3], "option");
  const version = p117SafeCode_(raw[7], "questionnaire version");
  const batch = p117SafeCode_(raw[8], "source batch");
  const date = p117IsoDate_(raw[6]);
  const verified = String(raw[9] || "").trim();
  if (!verified || verified.length > 100) throw new Error("Missing or oversized last_verified_at.");
  if (metric === "valid_response_total" && option !== "all") {
    throw new Error("Canonical respondent totals must use option_id=all.");
  }
  const safe = [expectedRound, seat, metric, option, count, eligible, date, version, batch, verified];
  return p117IsSynthetic_(safe) ? null : safe;
}

function p117ReadApprovals_(workbook, round) {
  const sheet = p117WorkbookSheet_(workbook, "Aggregate_Approvals");
  p117AssertHeader_(sheet, P117.APPROVAL_HEADERS);
  const approvals = new Map();
  p117Rows_(sheet, P117.APPROVAL_HEADERS.length).forEach((row) => {
    if (row.every((value) => value === "" || value == null)) return;
    const batch = p117SafeCode_(row[0], "approval batch");
    const seat = Number(row[2]);
    const status = String(row[3]);
    if (row[1] !== round || !Number.isInteger(seat) || seat < 1 || seat > 117) {
      throw new Error("Invalid aggregate approval registry entry.");
    }
    if (!["APPROVED", "REJECTED", "PENDING", "REVOKED"].includes(status)) {
      throw new Error("Unknown aggregate approval status.");
    }
    if (status === "APPROVED" && (!String(row[4]).trim() || !String(row[5]).trim())) {
      throw new Error("Approved batches require reviewer and review date.");
    }
    const key = p117ApprovalKey_(round, seat, batch);
    if (approvals.has(key)) throw new Error("Duplicate approval registry batch/seat key.");
    approvals.set(key, status);
  });
  return approvals;
}

function p117ReadApprovedSource_(source) {
  if (source.round === "EXIT") return { rows: [], skipped: 0, exitHeld: true };
  const workbook = SpreadsheetApp.openById(source.id);
  const summary = p117WorkbookSheet_(workbook, "Constituency_Summary_117");
  p117AssertHeader_(summary, P117.HEADERS);
  const approvals = p117ReadApprovals_(workbook, source.round);
  const rows = [];
  let skipped = 0;
  p117Rows_(summary, P117.HEADERS.length).forEach((raw) => {
    if (raw.every((value) => value === "" || value == null)) return;
    const safe = p117ValidateRow_(raw, source.round);
    if (!safe) {
      skipped++;
      return;
    }
    if (approvals.get(p117ApprovalKey_(safe[0], safe[1], safe[8])) !== "APPROVED") {
      skipped++;
      return;
    }
    rows.push(safe);
  });
  const keys = new Set();
  rows.forEach((row) => {
    const key = p117RecordKey_(row);
    if (keys.has(key)) throw new Error("Duplicate approved aggregate source batch row.");
    keys.add(key);
  });
  return { rows, skipped, exitHeld: false };
}

function p117Collect_(config) {
  const rows = [];
  let skipped = 0;
  config.sources.forEach((source) => {
    const read = p117ReadApprovedSource_(source);
    rows.push.apply(rows, read.rows);
    skipped += read.skipped;
  });
  if (rows.length > P117.ROW_CAP) throw new Error("Aggregate batch limit exceeded.");
  const keys = new Set();
  rows.forEach((row) => {
    const key = p117RecordKey_(row);
    if (keys.has(key)) throw new Error("Duplicate aggregate key across sources.");
    keys.add(key);
  });
  rows.sort((left, right) => p117RecordKey_(left).localeCompare(p117RecordKey_(right)));
  return { rows, skipped };
}

function p117Reconciliation_(current, desired) {
  const preservedSynthetic = [];
  const currentManaged = new Map();
  current.forEach((row) => {
    if (row.every((value) => value === "" || value == null)) return;
    if (p117IsSynthetic_(row)) {
      preservedSynthetic.push(row.slice(0, P117.HEADERS.length));
      return;
    }
    const key = p117RecordKey_(row);
    if (currentManaged.has(key)) throw new Error("Duplicate key already exists in master; manual review required.");
    currentManaged.set(key, row.slice(0, P117.HEADERS.length));
  });
  const desiredMap = new Map(desired.map((row) => [p117RecordKey_(row), row]));
  let inserts = 0;
  let updates = 0;
  desiredMap.forEach((row, key) => {
    const existing = currentManaged.get(key);
    if (!existing) inserts++;
    else if (row.some((value, index) => String(value) !== String(existing[index]))) updates++;
  });
  let removals = 0;
  currentManaged.forEach((_row, key) => {
    if (!desiredMap.has(key)) removals++;
  });
  return {
    inserts,
    updates,
    removals,
    finalRows: preservedSynthetic.concat(Array.from(desiredMap.values())),
  };
}

function p117Snapshot_() {
  const conf = p117Configuration_();
  p117AuditSharing_(conf);
  const sources = p117Collect_(conf);
  const master = SpreadsheetApp.openById(conf.master);
  const destination = p117WorkbookSheet_(master, "Approved_Aggregates");
  p117AssertHeader_(destination, P117.HEADERS);
  const current = p117Rows_(destination, P117.HEADERS.length);
  return {
    conf,
    master,
    destination,
    sources,
    current,
    reconciliation: p117Reconciliation_(current, sources.rows),
  };
}

function p117Report_(snapshot, mode) {
  return {
    mode,
    approvedAggregateRows: snapshot.sources.rows.length,
    newRows: snapshot.reconciliation.inserts,
    updatedRows: snapshot.reconciliation.updates,
    removedRows: snapshot.reconciliation.removals,
    rejectedOrSyntheticRows: snapshot.sources.skipped,
    exitRoundHeld: true,
    participantCollectionEnabled: false,
  };
}

function p117AuditTab_(master) {
  let sheet = master.getSheetByName("Sync_Audit");
  if (!sheet) sheet = master.insertSheet("Sync_Audit");
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, P117.AUDIT_HEADERS.length).setValues([P117.AUDIT_HEADERS]);
    sheet.setFrozenRows(1);
  } else {
    p117AssertHeader_(sheet, P117.AUDIT_HEADERS);
  }
  return sheet;
}

function p117Timestamp_() {
  return Utilities.formatDate(new Date(), P117.TIMESTAMP_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
}

function p117RecordFailure_(error) {
  try {
    const masterId = p117Property_("PANJAB117_MASTER_SHEET_ID");
    if (DriveApp.getFileById(masterId).getSharingAccess() !== DriveApp.Access.PRIVATE) return;
    const master = SpreadsheetApp.openById(masterId);
    p117AuditTab_(master).appendRow([
      p117Timestamp_(),
      "AGGREGATE_ONLY_SYNC",
      "FAILURE",
      0,
      0,
      0,
      0,
      0,
      String(error && error.message ? error.message : error).slice(0, 500),
    ]);
  } catch (auditError) {
    console.error("Unable to append failure audit: " + auditError.message);
  }
}

function dryRunAggregateSync() {
  const report = p117Report_(p117Snapshot_(), "DRY_RUN");
  console.log(JSON.stringify(report));
  return report;
}

function syncApprovedAggregates() {
  if (p117Property_(P117.ENABLE_KEY) !== "true") {
    throw new Error("Aggregate sync not activated in owner Script Properties.");
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error("Another aggregate sync is active.");
  try {
    const snapshot = p117Snapshot_();
    const finalRows = snapshot.reconciliation.finalRows;
    const writeHeight = Math.max(snapshot.current.length, finalRows.length);
    if (writeHeight > 0) {
      const blanks = Array.from({ length: P117.HEADERS.length }, () => "");
      const matrix = Array.from({ length: writeHeight }, (_value, index) => finalRows[index] || blanks);
      snapshot.destination.getRange(2, 1, writeHeight, P117.HEADERS.length).setValues(matrix);
      const verified = snapshot.destination.getRange(2, 1, writeHeight, P117.HEADERS.length).getValues();
      if (JSON.stringify(verified) !== JSON.stringify(matrix)) {
        throw new Error("Master reconciliation read-back mismatch.");
      }
    }
    const report = p117Report_(snapshot, "AGGREGATE_ONLY_SYNC");
    p117AuditTab_(snapshot.master).appendRow([
      p117Timestamp_(),
      "AGGREGATE_ONLY_SYNC",
      "SUCCESS",
      report.approvedAggregateRows,
      report.newRows,
      report.updatedRows,
      report.removedRows,
      report.rejectedOrSyntheticRows,
      "EXIT HELD; no respondent-level records or public website submissions",
    ]);
    console.log(JSON.stringify(report));
    return report;
  } catch (error) {
    p117RecordFailure_(error);
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function installHourlyAggregateTrigger() {
  if (p117Property_(P117.ENABLE_KEY) !== "true") {
    throw new Error("Review dryRunAggregateSync and explicitly set sync enabled first.");
  }
  p117Snapshot_();
  const exists = ScriptApp.getProjectTriggers().some(
    (trigger) => trigger.getHandlerFunction() === "syncApprovedAggregates",
  );
  if (exists) return { existingTrigger: true };
  ScriptApp.newTrigger("syncApprovedAggregates").timeBased().everyHours(1).create();
  return { hourlyAggregateTriggerCreated: true, collectionStillDisabled: true };
}

function disableAggregateSynchronization() {
  PropertiesService.getScriptProperties().setProperty(P117.ENABLE_KEY, "false");
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === "syncApprovedAggregates")
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
  return { scheduledAggregateSyncDisabled: true };
}
