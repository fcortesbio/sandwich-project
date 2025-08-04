/**
 * @fileoverview A library of functions for managing customer data in a Google Sheet.
 * This script provides an API to register, find, and validate customer records
 * stored in a sheet named "customers".
 */

// ===  Constants  ===
const NON_DIGITS_REGEX = /\D/g; // Matches all characters that are NOT digits.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validates a standard email structure like name@domain.com

// ================  Helpers  ================

/**
 * Private helper to log errors to the console with a specific context.
 * @private
 * @param {string} context - The name of the function or context where the error occurred.
 * @param {Error|string} error - The error object or message to log.
 */
function _logError(context, error) {
  console.error(`[${context}] ${error?.message || error}`);
}

/**
 * Private helper to convert a spreadsheet row (array) into a customer object.
 * @private
 * @param {Array<string|number>} row - The array of cell values for a single customer.
 * @param {Array<string>} headers - The array of header names from the sheet.
 * @returns {Object} A customer object with key-value pairs.
 */
function _rowToCustomerObject(row, headers) {
  const customer = {};
  headers.forEach((header, index) => {
    customer[header] = row[index];
  });
  return customer;
}

/**
 * Private generic helper to find a customer row by a specific column name and value.
 * @private
 * @param {string} columnName - The name of the column to search in (e.g., "phone").
 * @param {string|number} value - The value to search for.
 * @returns {Object|null} The full customer object if found, otherwise null.
 */
function _findCustomerBy(columnName, value) {
  try {
    const sheet = _getCustomersSheetOrThrow();
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Remove headers from data and store them

    const columnIndex = headers.indexOf(columnName);
    if (columnIndex === -1) return null; // Column not found

    const normalizedValue = String(value).trim().toLowerCase();

    for (const row of data) {
      const cellValue = String(row[columnIndex]).trim().toLowerCase();
      if (cellValue === normalizedValue) {
        return _rowToCustomerObject(row, headers);
      }
    }
    return null; // Not found
  } catch (error) {
    _logError("_findCustomerBy", error);
    return null;
  }
}

/**
 * Validates and cleans a phone number string.
 * @private
 * @param {string} phone - The raw phone number input to validate.
 * @returns {{success: boolean, value: string|null}} An object where `success` is true if the phone has 10 digits after cleaning, and `value` is the cleaned number or null.
 */
function _phoneValidator(phone) {
  if (!phone || typeof phone !== "string") {
    return { success: false, value: null };
  }
  const digitsOnly = phone.replace(NON_DIGITS_REGEX, "");
  return digitsOnly.length === 10
    ? { success: true, value: digitsOnly }
    : { success: false, value: null };
}

/**
 * Validates an email address string.
 * @private
 * @param {string} email - The email address to validate.
 * @returns {{success: boolean, value: string|null}} An object where `success` is true if the email format is valid, and `value` is the cleaned email or null.
 */
function _emailValidator(email) {
  if (!email || typeof email !== "string") {
    return { success: false, value: null };
  }
  const trimmed = email.trim().toLowerCase();
  return EMAIL_REGEX.test(trimmed)
    ? { success: true, value: trimmed }
    : { success: false, value: null };
}

/**
 * Retrieves the "customers" sheet or throws a critical error if it's not found.
 * @private
 * @throws {Error} If the "customers" sheet cannot be found.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The "customers" sheet object.
 */
function _getCustomersSheetOrThrow() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("customers");
  if (!sheet) {
    throw new Error(
      "Sheet 'customers' not found. Please run setupSpreadsheets() first.",
    );
  }
  return sheet;
}

// ================ CORE FUNCTIONS ================

/**
 * Finds a customer by their 10-digit phone number.
 * @param {string} phone The phone number to search for.
 * @returns {Object|null} A customer object if found, otherwise null.
 */
function findCustomerByPhone(phone) {
  const normalizedPhone = _phoneValidator(phone)?.value;
  if (!normalizedPhone) return null;
  return _findCustomerBy("phone", normalizedPhone);
}

/**
 * Finds a customer by their email address (case-insensitive).
 * @param {string} email The email address to search for.
 * @returns {Object|null} A customer object if found, otherwise null.
 */
function findCustomerByEmail(email) {
  const normalizedEmail = _emailValidator(email)?.value;
  if (!normalizedEmail) return null;
  return _findCustomerBy("email", normalizedEmail);
}

/**
 * Finds a customer by their unique customer ID.
 * @param {string} customerId The customer ID to search for (e.g., "C00001").
 * @returns {Object|null} A customer object if found, otherwise null.
 */
function findCustomerById(customerId) {
  if (!customerId) return null;
  return _findCustomerBy("customer_id", customerId);
}

/**
 * Finds a customer by exact first and last name match (case-insensitive).
 * @param {string} firstName
 * @param {string} lastName
 * @returns {Object|null}
 */
function findCustomerByFullName(firstName, lastName) {
  if (!firstName || !lastName) return null;

  const lowerFirst = firstName.trim().toLowerCase();
  const lowerLast = lastName.trim().toLowerCase();

  const allCustomers = getAllCustomers();

  return (
    allCustomers.find(
      (c) =>
        (c.first_name || "").toLowerCase() === lowerFirst &&
        (c.last_name || "").toLowerCase() === lowerLast,
    ) || null
  );
}

/**
 * Retrieves all customer records from the spreadsheet.
 * @returns {Array<Object>} An array of all customer objects. Returns an empty array on error or if no customers exist.
 */
function getAllCustomers() {
  try {
    const sheet = _getCustomersSheetOrThrow();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // No customers besides the header

    const headers = data.shift(); // Remove header row
    return data.map((row) => _rowToCustomerObject(row, headers));
  } catch (error) {
    _logError("getAllCustomers", error);
    return [];
  }
}

/**
 * Registers a new customer by adding a new row to the sheet.
 * @param {Object} customerData - The customer's information.
 * @param {string} customerData.first_name - The customer's first name.
 * @param {string} customerData.last_name - The customer's last name.
 * @param {string} customerData.phone - The customer's 10-digit phone number.
 * @param {string} [customerData.email] - The customer's optional email address.
 * @returns {{success: boolean, customer: Object}|{success: boolean, error: string}} An object containing the new customer record on success, or an error message on failure.
 */
function registerCustomer({ first_name, last_name, phone, email }) {
  try {
    // Preprocess and normalize inputs
    const cleanFirstName = first_name?.trim();
    const cleanLastName = last_name?.trim();

    // 1. Validate required fields
    if (!cleanFirstName || !cleanLastName || !phone) {
      throw new Error(
        "Fields 'first_name', 'last_name', and 'phone' are required",
      );
    }

    // 2. Validate phone and email formats
    const phoneValidation = _phoneValidator(phone);
    if (!phoneValidation.success) {
      throw new Error("Phone number must be 10 digits");
    }
    const normalizedPhone = phoneValidation.value;

    let normalizedEmail = "";
    if (email) {
      const emailValidation = _emailValidator(email);
      if (!emailValidation.success) {
        throw new Error("Invalid email format");
      }
      normalizedEmail = emailValidation.value;
    }

    // 3. Check for duplicates
    if (findCustomerByPhone(normalizedPhone)) {
      throw new Error("Customer with this phone number already exists");
    }
    if (normalizedEmail && findCustomerByEmail(normalizedEmail)) {
      throw new Error("Customer with this email already exists");
    }

    // 4. Create new customer record
    const sheet = _getCustomersSheetOrThrow();
    const customerId = generateCustomerId();
    const registeredAt = new Date().toISOString();

    const newCustomer = {
      customer_id: customerId,
      first_name: cleanFirstName,
      last_name: cleanLastName,
      phone: normalizedPhone,
      email: normalizedEmail,
      registered_at: registeredAt,
    };

    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const newRow = headers.map((header) => newCustomer[header] || "");
    sheet.appendRow(newRow);

    console.log(`Customer ${customerId} registered successfully`);

    return { success: true, customer: newCustomer };
  } catch (error) {
    _logError("registerCustomer", error);
    return { success: false, error: error.message };
  }
}

/**
 * Generates the next sequential customer ID (e.g., C00001, C00002).
 * Finds the highest existing ID and increments it.
 * @returns {string} The new unique customer ID.
 */
function generateCustomerId() {
  try {
    const sheet = _getCustomersSheetOrThrow();
    const idColumnIndex = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .indexOf("customer_id");
    if (idColumnIndex === -1) throw new Error("Missing 'customer_id' column");

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return "C00001"; // No existing customers

    const lastId = sheet.getRange(lastRow, idColumnIndex + 1).getValue();
    if (!lastId || !/^C\d{5}$/.test(lastId)) {
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
      return `C${String(nextIdNum).padStart(5, "0")}`;
    }

    const lastIdNum = parseInt(lastId.slice(1), 10);
    const nextIdNum = lastIdNum + 1;
    return `C${String(nextIdNum).padStart(5, "0")}`;
  } catch (error) {
    _logError("generateCustomerId", error);
    // Fallback ID in case of critical error, less reliable but prevents failure.
    return `C${Date.now().toString().slice(-5)}`;
  }
}
