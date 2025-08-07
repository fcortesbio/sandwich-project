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
 * Private helper to log errors to the console with a specific context.
 * @private
 * @param {string} context - The name of the function or context where the error occurred.
 * @param {Error|string} error - The error object or message to log.
 */
function _logError(context, error) {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error(`[${context}] ${errorMessage}`);
  // console.error(`[${context}] ${error?.message || error}`);
}
