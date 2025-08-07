/**
 * Sandwich API
 * Initialize spreadsheet structure for customer and sales management
 */

/**
 * Performs first-time setup for the spreadsheet.
 * Creates the `customers` and `sales_summary` sheets with headers if they don't exist.
 * Deletes the default "Sheet1" if it is present.
 * @returns {{success: boolean, actions: Array<string>|null}} An object containing a success flag and a list of actions performed, or null if no actions were taken.
 */
function setupSpreadsheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const actions = [];

  // Create the `customers` sheet if it doesn't already exist.
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
    actions.push("Sheet `customers` created.");
  }

  // Create the `sales_summary` sheet if it doesn't already exist.
  if (!ss.getSheetByName("sales_summary")) {
    const summarySheet = ss.insertSheet("sales_summary");
    summarySheet.appendRow([
      "month",
      "status", // "pending" or "settled"
      "last_updated_at",
    ]);
    actions.push("Sheet `sales_summary` created.");
  }

  // Delete the default "Sheet1" if it exists.
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) {
    ss.deleteSheet(defaultSheet);
    actions.push("Sheet `Sheet1` has been deleted.");
  }

  // Return a success object with the list of actions.
  return actions.length === 0
    ? { success: true, actions: null }
    : { success: true, actions: actions };
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
