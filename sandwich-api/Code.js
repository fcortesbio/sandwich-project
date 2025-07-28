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
