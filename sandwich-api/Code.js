/**
 * Sandwich API
 * Initialize spreadsheet structure for customer and sales management
 */

/**
 * Performs first-time setup for the spreadsheet.
 * Creates the `customers` and `sales_summary` sheets with headers if they don't exist.
 * Deletes the default "Sheet1" if it is present.
 */
function setupSpreadsheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Create the `customers` sheet if it doesn't already exist.
  if (!ss.getSheetByName("customers")) {
    const customersSheet = ss.insertSheet("customers");
    // Add header row to the new sheet.
    customersSheet.appendRow([
      "customer_id",
      "first_name",
      "last_name",
      "phone",
      "email",
      "registered_at",
    ]);
    console.log("Sheet `customers` created.");
  }

  // Create the `sales_summary` sheet if it doesn't already exist.
  if (!ss.getSheetByName("sales_summary")) {
    const summarySheet = ss.insertSheet("sales_summary");
    // Add header row to the new sheet.
    summarySheet.appendRow([
      "month",
      "status", // "pending" or "settled"
      "last_updated_at",
    ]);
    console.log("Sheet 'sales_summary' created.");
  }

  // Find the default sheet named "Sheet1".
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) {
    // If "Sheet1" exists, delete it.
    ss.deleteSheet(defaultSheet);
    console.log("Sheet 'Sheet1' has been deleted.");
  }
}

/**
 * Returns sheet name for sales by Date
 * Sheet name format: `sales_YYYY_MM`
 * @param {Date} [date=new Date()] The date to generate the sheet name for.
 * @return {string} The formatted sheet name.
 */
function getMonthlySalesSheetName(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `sales_${year}_${month}`;
}

/**
 * Creates a new sales sheet for a given date if it doesn't exist.
 * Sheet name format: 'sales_YYYY_MM'
 * @param {Date} [date=new Date()] The date for which to create the sales sheet.
 */
function createMonthSalesSheet(date = new Date()) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = getMonthlySalesSheetName(date);

  if (!ss.getSheetByName(sheetName)) {
    const sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      "sale_id",
      "customer_id",
      "quantity",
      "unit_price",
      "total_price",
      "amount_paid",
      "pending_balance",
      "status",
      "sale_datetime",
      "last_payment_datetime",
    ]);
    console.log(`Sheet '${sheetName}' created.`);
  }
}

/**
 * Ensures a month sales sheet exists and returns it.
 * @param {Date} [date=new Date()] The date for the sheet to get.
 * @return {Sheet} The Google Sheet object for the specified month.
 */
function getMonthSalesSheet(date = new Date()) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = getMonthlySalesSheetName(date);

  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    createMonthSalesSheet(date);
    sheet = ss.getSheetByName(sheetName);
  }
  return sheet;
}

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
