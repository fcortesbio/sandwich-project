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
    summarySheet.appendRow(["month", "status", "last_updated_at"]);
    actions.push("Sheet `sales_summary` created.");
  }

  // Create the `settings` sheet and initialize ID counters.
  if (!ss.getSheetByName("settings")) {
    const settingsSheet = ss.insertSheet("settings");
    settingsSheet.appendRow(["key", "value"]);
    settingsSheet.appendRow(["last_customer_id_number", "0"]); // Initialize the customer ID counter
    settingsSheet.appendRow(["last_sale_id_number", "0"]); // Initialize the sale ID counter
    actions.push("Sheet `settings` created with ID counters.");
  }

  // Delete the default "Sheet1" if it exists.
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) {
    ss.deleteSheet(defaultSheet);
    actions.push("Sheet `Sheet1` deleted.");
  }

  // Always return a consistent object.
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
  // Use a more robust check for the error message
  const errorMessage = error instanceof Error ? error.message : error;
  console.error(`[${context}] ${errorMessage}`);
}
