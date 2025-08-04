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

function registerSale({ customer_id, quantity, amount_paid }) {
  // 1. Get current sales sheet
  // 2. Generate sale_id
  // 3. Compute totals and status
  // 4. Write to the sheet
  // 5. Optionally update summary
  return;
}

function listPendingSales() {
  // Read only from sheets marked "pending" in sales_summary
  return;
}
