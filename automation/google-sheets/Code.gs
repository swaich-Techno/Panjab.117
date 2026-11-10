/**
 * PANJAB 117 aggregate-only Google Apps Script template.
 *
 * This code is intentionally not deployed. It has no doGet/doPost endpoint,
 * receives no browser submissions, stores no credentials, and never imports
 * record-level responses. An owner must first restrict all workbooks, approve
 * the exact deployment, and create a time trigger using the owner account.
 */
const PANJAB117_CONFIG = Object.freeze({
  collectionEnabled: false,
  exitPublicationEnabled: false,
});

function requiredScriptProperty_(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw new Error(`Missing required script property: ${name}`);
  return value;
}

function destinationConfiguration_() {
  return Object.freeze({
    masterSpreadsheetId: requiredScriptProperty_(
      "PANJAB117_MASTER_SHEET_ID",
    ),
    rounds: Object.freeze([
      Object.freeze({
        id: "PRE1",
        spreadsheetId: requiredScriptProperty_("PANJAB117_PRE1_SHEET_ID"),
      }),
      Object.freeze({
        id: "PRE2",
        spreadsheetId: requiredScriptProperty_("PANJAB117_PRE2_SHEET_ID"),
      }),
      Object.freeze({
        id: "PRE3",
        spreadsheetId: requiredScriptProperty_("PANJAB117_PRE3_SHEET_ID"),
      }),
      Object.freeze({
        id: "EXIT",
        spreadsheetId: requiredScriptProperty_("PANJAB117_EXIT_SHEET_ID"),
      }),
    ]),
  });
}

const ROUND_TABS = Object.freeze([
  "Survey_Metadata",
  "Constituency_Registry",
  "Intake_Staging",
  "Consent_Operations",
  "Quality_Control",
  "Constituency_Summary_117",
  "Constituency_Mini_Dashboard",
  "Daily_Trend",
  "Voting_Opinion_Aggregates",
  "Source_And_Methodology",
  "Sync_Status",
]);

const AGGREGATE_HEADERS = Object.freeze([
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
]);

function assertSafeConfiguration_() {
  if (PANJAB117_CONFIG.collectionEnabled) {
    throw new Error("This reporting-only script cannot enable collection.");
  }
  if (PANJAB117_CONFIG.exitPublicationEnabled) {
    throw new Error("EXIT publication must remain disabled.");
  }
}

function ensureSheet_(workbook, name) {
  return workbook.getSheetByName(name) || workbook.insertSheet(name);
}

function ensureHeader_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function prepareRoundWorkbooks() {
  assertSafeConfiguration_();
  destinationConfiguration_().rounds.forEach((round) => {
    const workbook = SpreadsheetApp.openById(round.spreadsheetId);
    ROUND_TABS.forEach((name) => ensureSheet_(workbook, name));
    ensureHeader_(
      ensureSheet_(workbook, "Constituency_Summary_117"),
      AGGREGATE_HEADERS,
    );
  });
}

function rowKey_(row) {
  return [row[0], row[1], row[2], row[3], row[6], row[8]].join("|");
}

function readApprovedAggregateRows_(round) {
  const workbook = SpreadsheetApp.openById(round.spreadsheetId);
  const source = workbook.getSheetByName("Constituency_Summary_117");
  if (!source || source.getLastRow() < 2) return [];
  const rows = source
    .getRange(2, 1, source.getLastRow() - 1, AGGREGATE_HEADERS.length)
    .getValues();
  return rows.filter(
    (row) =>
      row[0] === round.id &&
      Number.isInteger(row[1]) &&
      row[1] >= 1 &&
      row[1] <= 117 &&
      Number.isInteger(row[4]) &&
      Number.isInteger(row[5]) &&
      row[4] >= 0 &&
      row[5] >= row[4] &&
      String(row[8]).length > 0,
  );
}

function syncApprovedAggregates() {
  assertSafeConfiguration_();
  const destinations = destinationConfiguration_();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error("Another sync is active.");
  try {
    const master = SpreadsheetApp.openById(destinations.masterSpreadsheetId);
    const destination = ensureSheet_(master, "Approved_Aggregates");
    ensureHeader_(destination, AGGREGATE_HEADERS);
    const current =
      destination.getLastRow() < 2
        ? []
        : destination
            .getRange(
              2,
              1,
              destination.getLastRow() - 1,
              AGGREGATE_HEADERS.length,
            )
            .getValues();
    const merged = new Map(current.map((row) => [rowKey_(row), row]));
    destinations.rounds.forEach((round) => {
      readApprovedAggregateRows_(round).forEach((row) =>
        merged.set(rowKey_(row), row),
      );
    });
    const rows = Array.from(merged.values());
    if (destination.getLastRow() > 1) {
      destination
        .getRange(
          2,
          1,
          destination.getLastRow() - 1,
          AGGREGATE_HEADERS.length,
        )
        .clearContent();
    }
    if (rows.length > 0) {
      destination
        .getRange(2, 1, rows.length, AGGREGATE_HEADERS.length)
        .setValues(rows);
    }
  } finally {
    lock.releaseLock();
  }
}
