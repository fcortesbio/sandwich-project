/**
 * Sales Management Functions
 * Handles sales registration, payment tracking, and monthly ledger management
 */

// ===  Constants  ===
const DEFAULT_UNIT_PRICE = 15000;
const SALE_STATUS = {
  PAID: "Paid",
  PARTIAL: "Partial",
  UNPAID: "Unpaid",
};

// ================  Helpers  ================

/**
 * Private helper to get or create a sales sheet for a specific month
 * @private
 * @param {string} month - Month in YYYY-MM format
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The sales sheet for the month
 */
function _getSalesSheetForMonth(month) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = `sales_${month.replace("-", "_")}`;

  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    // Create new sales sheet for this month
    sheet = ss.insertSheet(sheetName);
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
    console.log(`Sales sheet for ${month} created`);
  } else console.log(`Sales sheet for ${month} already exists`);

  return sheet;
}

/**
 * Private helper to convert a spreadsheet row to a sale object
 * @private
 * @param {Array} row - The array of cell values for a single sale
 * @param {Array} headers - The array of header names from the sheet
 * @returns {Object} A sale object with key-value pairs
 */
function _rowToSaleObject(row, headers) {
  const sale = {};
  headers.forEach((header, index) => {
    sale[header] = row[index];
  });
  return sale;
}

/**
 * Private helper to generate the next sale ID for a specific month sheet
 * @private
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sales sheet
 * @returns {string} The new unique sale ID (e.g., S00001)
 */
function _generateSaleId(sheet) {
  try {
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const idColumnIndex = headers.indexOf("sale_id");
    if (idColumnIndex === -1) throw new Error("Missing 'sale_id' column");

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return "S00001"; // No existing sales

    const lastId = sheet.getRange(lastRow, idColumnIndex + 1).getValue();
    if (!lastId || !/^S\d{5}$/.test(lastId)) {
      // Fallback if last ID is malformed, scan all IDs
      const allIds = sheet
        .getRange(2, idColumnIndex + 1, lastRow - 1, 1)
        .getValues()
        .flat();
      const maxIdNum = allIds.reduce((max, id) => {
        const num = parseInt(String(id).slice(1), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      const nextIdNum = maxIdNum + 1;
      return `S${String(nextIdNum).padStart(5, "0")}`;
    }

    const lastIdNum = parseInt(lastId.slice(1), 10);
    const nextIdNum = lastIdNum + 1;
    return `S${String(nextIdNum).padStart(5, "0")}`;
  } catch (error) {
    _logError("_generateSaleId", error);
    // Fallback ID in case of critical error
    return `S${Date.now().toString().slice(-5)}`;
  }
}

/**
 * Private helper to calculate sale status based on payment
 * @private
 * @param {number} totalPrice - Total price of the sale
 * @param {number} amountPaid - Amount already paid
 * @returns {string} Sale status (Paid, Partial, Unpaid)
 */
function _calculateSaleStatus(totalPrice, amountPaid) {
  if (amountPaid >= totalPrice) return SALE_STATUS.PAID;
  if (amountPaid > 0) return SALE_STATUS.PARTIAL;
  return SALE_STATUS.UNPAID;
}
