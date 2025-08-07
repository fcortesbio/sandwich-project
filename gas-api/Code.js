/**
 * Sandwich API
 * Initialize spreadsheet structure for customer and sales management
 */

/**
 * Performs first-time setup for the spreadsheet.
 * Creates the `customers`, `sales_summary`, and `settings` sheets.
 * @returns {{success: boolean, actions: Array<string>}} An object containing a success flag and a list of actions performed.
 */
function setupSpreadsheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const actions = [];

  // Existing code to create 'customers' and 'sales_summary' sheets...
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
  if (!ss.getSheetByName("sales_summary")) {
    const summarySheet = ss.insertSheet("sales_summary");
    summarySheet.appendRow(["month", "status", "last_updated_at"]);
    actions.push("Sheet `sales_summary` created.");
  }
  if (!ss.getSheetByName("settings")) {
    const settingsSheet = ss.insertSheet("settings");
    settingsSheet.appendRow(["key", "value"]);
    settingsSheet.appendRow(["last_customer_id_number", "0"]); // Initialize the counter
    actions.push("Sheet `settings` created with ID counter.");
  }

  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) {
    ss.deleteSheet(defaultSheet);
    actions.push("Sheet `Sheet1` deleted.");
  }

  const message =
    actions.length === 0 ? "No action required." : "Setup completed.";
  return { success: true, message: message, actions: actions };
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
