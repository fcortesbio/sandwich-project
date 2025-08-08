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
 * Retrieves the last sale ID from the settings sheet and increments it.
 * Throws an error if the settings sheet or key is not found.
 * @private
 * @returns {string} The new unique sale ID (e.g., "S00001").
 */
function _generateNextSaleId() {
  try {
    const settingsSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("settings");
    if (!settingsSheet) {
      throw new Error("Settings sheet not found. Please run setup first.");
    }

    // Find the row with the last sale ID counter
    const data = settingsSheet.getDataRange().getValues();
    let lastIdNumRow = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === "last_sale_id_number") {
        lastIdNumRow = i;
        break;
      }
    }

    if (lastIdNumRow === -1) {
      throw new Error("Missing 'last_sale_id_number' in settings sheet.");
    }

    // Get the last ID number, increment it, and update the sheet
    const lastIdNum = parseInt(data[lastIdNumRow][1], 10);
    const nextIdNum = lastIdNum + 1;
    settingsSheet.getRange(lastIdNumRow + 1, 2).setValue(nextIdNum);

    return `S${String(nextIdNum).padStart(5, "0")}`;
  } catch (error) {
    _logError("_generateNextSaleId", error);
    throw new Error("Failed to generate a new sale ID.");
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

/**
 * Handles data validation for sale input data prior registerSale(sale) execution
 * @param {string} customerId
 * @param {number} quantity
 * @param {number} amountPaid
 * @returns {object} The validated and sanitized sale data object.
 */
function _validateSale(customerId, quantity, amountPaid) {
  // Validate:
  // Inputs required are present
  if (
    !customerId ||
    quantity === null ||
    quantity === undefined ||
    amountPaid === null ||
    amountPaid === undefined
  ) {
    throw new Error(
      "Missing required fields: customerId, quantity, amountPaid",
    );
  }

  // customerId matches with an already existing customer
  // This uses functions from Customer.js module
  if (!_customerIdIsValid(customerId)) {
    throw new Error(
      `Customer ID '${customerId}' is not in the correct format.`,
    );
  }
  if (!_customerExists(customerId)) {
    throw new Error(`Customer with ID '${customerId}' does not exist.`);
  }

  // Quantity and amount paid are numbers and integers
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    typeof amountPaid !== "number" ||
    !Number.isInteger(amountPaid)
  ) {
    throw new Error("Quantity and amountPaid must be integers.");
  }

  // Quantity greater than 0, and Amount paid is non-negative
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0.");
  }
  if (amountPaid < 0) {
    throw new Error("Amount paid cannot be a negative number.");
  }

  // Amount paid isn't greater than Quantity * DEFAULT_UNIT_PRICE
  const totalPrice = quantity * DEFAULT_UNIT_PRICE;
  if (amountPaid > totalPrice) {
    throw new Error(
      `Amount paid (${amountPaid}) cannot be greater than the total price (${totalPrice}).`,
    );
  }

  // If all validations pass, return the sanitized and validated data
  return { customerId, quantity, amountPaid };
}

// ================ CORE FUNCTIONS ================

/**
 * Registers a new sale for a customer.
 * @param {string} customerId - The ID of the customer making the purchase.
 * @param {number} quantity - The number of units sold.
 * @param {number} amountPaid - The initial amount paid.
 * @returns {{success: boolean, sale: Object}|{success: boolean, error: string}} An object with the new sale record on success, or an error message on failure.
 */
function registerSale(customerId, quantity, amountPaid) {
  try {
    // 1. Validate inputs using our helper function
    _validateSale(customerId, quantity, amountPaid);

    // 2. Compute sale details
    const saleDate = new Date();
    const month = Utilities.formatDate(
      saleDate,
      Session.getScriptTimeZone(),
      "yyyy-MM",
    );
    const totalPrice = quantity * DEFAULT_UNIT_PRICE;
    const pendingBalance = totalPrice - amountPaid;
    const status = _calculateSaleStatus(totalPrice, amountPaid);

    // 3. Get the correct sheet and generate a unique sale ID
    const sheet = _getSalesSheetForMonth(month);
    const saleId = _generateNextSaleId();

    // 4. Construct the new sale object
    const newSale = {
      sale_id: saleId,
      customer_id: customerId,
      quantity: quantity,
      unit_price: DEFAULT_UNIT_PRICE,
      total_price: totalPrice,
      amount_paid: amountPaid,
      pending_balance: pendingBalance,
      status: status,
      sale_datetime: saleDate.toISOString(),
      last_payment_datetime: saleDate.toISOString(),
    };

    // 5. Append the new row to the sheet
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const newRow = headers.map((header) => newSale[header] || "");
    sheet.appendRow(newRow);

    console.log(
      `Sale ${saleId} registered successfully for customer ${customerId}`,
    );

    return { success: true, sale: newSale };
  } catch (error) {
    _logError("registerSale", error);
    return { success: false, error: error.message };
  }
}
