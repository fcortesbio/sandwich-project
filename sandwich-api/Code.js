/**
 * Sandwich API
 * Initialize spreadsheet structure for customer and sales management
 */

/**
 * First time set up Spreadsheet set up
 * Creates the tables `customers` and `sales_summary` with headers if not present
 */
function setupSpreadsheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create `customers` sheet
  if (!ss.getSheetByName("customers")) {
    const customersSheet = ss.insertSheet("customers");
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

  if (!ss.getSheetByName("sales_summary")) {
    const summarySheet = ss.insertSheet("sales_summary");
    summarySheet.appendRow([
      "month",
      "status", // "pending" or "settled"
      "last_updated_at",
    ]);
    console.log("Sheet 'sales_summary' created");
  }
}

/**
 * Returns sheet name for sales by Date
 * Sheet name format: `sales_YYYY_MM`
 */
function getMonthlySalesSheetName(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `sales_${year}_${month}`;
}

/**
 * Creates a new sales sheet for a given date if it doesn't exist summarySheet
 * Sheet name format: 'sales_YYYY_MM'
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
 * Ensures a month sales sheet exists and return it
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
 * Scans all `sales_YYYY_MM` sheets
 * Determine whether each month has any pending balance
 * Updates `sales_summary` sheet accordingly
 */
function updateSalesSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
}
