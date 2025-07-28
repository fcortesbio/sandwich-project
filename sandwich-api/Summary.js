/**
 * Scans all `sales_YYYY_MM` sheets, determines whether each month has any
 * pending balance, and updates the `sales_summary` sheet accordingly.
 */
function updateSalesSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const summarySheet = ss.getSheetByName("sales_summary");
  if (!summarySheet) {
    console.error(
      "Sales summary sheet not found. Please run setupSpreadsheets().",
    );
    return;
  }
  const allSheets = ss.getSheets();

  const monthStatusMap = {};
  const now = new Date();

  allSheets.forEach((sheet) => {
    const name = sheet.getName();
    // Test if the sheet name matches the sales sheet format.
    if (/sales_\d{4}_\d{2}/.test(name)) {
      const data = sheet.getDataRange().getValues();
      // If sheet is empty or only has a header, mark as settled.
      if (data.length <= 1) {
        // <-- Corrected typo here
        monthStatusMap[name] = "settled";
        return;
      }

      const headers = data[0];
      const pendingIdx = headers.indexOf("pending_balance");

      if (pendingIdx === -1) {
        console.warn(`Sheet '${name}' is missing 'pending_balance' header.`);
        return;
      }

      // Check if any row has a pending balance greater than 0.
      const hasPending = data
        .slice(1) // Skip header row
        .some((row) => Number(row[pendingIdx]) > 0);
      monthStatusMap[name] = hasPending ? "pending" : "settled";
    }
  });
  // Clear and rebuild summary sheet.
  summarySheet.clearContents();
  summarySheet.appendRow(["month", "status", "last_updated_at"]);

  // Add the updated status for each month to the summary sheet.
  Object.entries(monthStatusMap).forEach(([month, status]) => {
    summarySheet.appendRow([
      month,
      status,
      Utilities.formatDate(
        now,
        Session.getScriptTimeZone(),
        "yyyy-MM-dd HH:mm:ss",
      ),
    ]);
  });
  console.log("Sales summary updated.");
}
