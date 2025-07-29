/**
 * Customer Management Functions
 * Handles customer registration, lookup, and validation
 */

// ===  Constants  ===
// Regex patterns for data input validation
const NON_DIGITS_REGEX = /\D/g; // Matches all characters that are NOT digits.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validates a standard email structure like name@domain.com

// ================  Helpers   ================

// private logger helper
function _logError(context, error) {
  console.error(`[${context}] ${error?.message || error}`);
}

// private helper to build a customer object from a sheet row
function _rowToCustomerObject(row, headers) {
  const customer = {};
  headers.forEach((header, index) => {
    customer[header] = row[index];
  });
  return customer;
}

// private helper that finds a customer by any column
function _findCustomerBy(columnName, value) {
  try {
    const sheet = _getCustomersSheetOrThrow();
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Remove headers from data and store them

    const columnIndex = headers.indexOf(columnName);
    if (columnIndex === -1) return null; // Column not found

    const normalizedValue = String(value).trim().toLowerCase();
    const normalize = (v) =>
      columnName === "customer_id"
        ? String(v).trim().toUpperCase()
        : String(v).trim().toLowerCase();

    for (const row of data) {
      const cellValue = normalize(row[columnIndex]);
      if (cellValue === normalize(normalizedValue)) {
        return _rowToCustomerObject(row, headers); // Use helper to build the object
      }
    }
    return null; // Not found
  } catch (error) {
    _logError("_findCustomerBy", error);
    return null;
  }
}

function _phoneValidator(phone) {
  // 1. Return a failure object if the input is empty or not a string.
  if (!phone || typeof phone !== "string") {
    return { success: false, value: null };
  }
  // 2. Remove all non-digit characters from the string.
  let digitsOnly = phone.replace(NON_DIGITS_REGEX, "");

  // 3. Return the appropriate object based on whether the result is 10 digits.
  return digitsOnly.length === 10
    ? { success: true, value: digitsOnly }
    : { success: false, value: null };
}

function _emailValidator(email) {
  // 1. Return a failure object if the input is empty or not a string.
  if (!email || typeof email !== "string") {
    return { success: false, value: null };
  }
  // 2. Trim whitespace and convert to lowercase for cleaner validation.
  const trimmed = email.trim().toLowerCase();

  // 3. Test the cleaned email against the global regular expression.
  return EMAIL_REGEX.test(trimmed)
    ? { success: true, value: trimmed }
    : { success: false, value: null };
}

/**
 * Retrieves a specific sheet named "customers" from the active spreadsheet.
 * This is a guard function that ensures the sheet exists before other code tries to use it.
 *
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

// --- Customer finders ---
function findCustomerByPhone(phone) {
  const normalizedPhone = _phoneValidator(phone)?.value;
  if (!normalizedPhone) return null;
  return _findCustomerBy("phone", normalizedPhone);
}

function findCustomerByEmail(email) {
  const normalizedEmail = _emailValidator(email)?.value;
  if (!normalizedEmail) return null;
  return _findCustomerBy("email", normalizedEmail);
}

function findCustomerById(customerId) {
  return _findCustomerBy("customer_id", customerId);
}

/**
 * Gets all customers from the spreadsheet
 * @returns {Array} Array of customer objects
 */
function getAllCustomers() {
  try {
    const sheet = _getCustomersSheetOrThrow();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const headers = data[0];
    return data.slice(1).map((row) => _rowToCustomerObject(row, headers));
  } catch (error) {
    _logError("getAllCustomers", error);
    // console.error("Error getting all customers:", error.message);
    return [];
  }
}

// --- Create/Patch users ---
/**
 * Registers a new customer in the spreadsheet
 * @param {Object} customerData - Customer information
 * @param {string} customerData.first_name - Customer's first name
 * @param {string} customerData.last_name - Customer's last name
 * @param {string} customerData.phone - Customer's phone number
 * @param {string} customerData.email - Customer's email address
 * @returns {Object} The newly created customer record or error
 */
function registerCustomer({ first_name, last_name, phone, email }) {
  try {
    // Preprocess and normalize
    first_name = first_name?.trim();
    last_name = last_name?.trim();
    phone = phone?.trim();
    email = email?.trim();

    // 1. Validate input
    if (!first_name || !last_name || !phone) {
      throw new Error(
        "Fields 'first_name', 'last_name', and 'phone' are required",
      );
    }

    const phoneValidation = _phoneValidator(phone);
    if (!phoneValidation.success) {
      throw new Error("Phone number must be 10 digits");
    }
    const normalizedPhone = phoneValidation.value;

    let normalizedEmail; // <-- FIX: Changed to let
    if (email) {
      const emailValidation = _emailValidator(email);
      if (!emailValidation.success) {
        throw new Error("Invalid email format");
      }
      normalizedEmail = emailValidation.value;
    } else {
      normalizedEmail = "";
    }

    // 2. Check for duplicates
    if (findCustomerByPhone(normalizedPhone)) {
      throw new Error("Customer with this phone number already exists");
    }

    if (normalizedEmail && findCustomerByEmail(normalizedEmail)) {
      // <-- FIX: Use normalizedEmail
      throw new Error("Customer with this email already exists");
    }

    // 3. Create new row
    const sheet = _getCustomersSheetOrThrow();
    const customerId = generateCustomerId(); // Assuming this function exists
    const registeredAt = new Date().toISOString();

    const newCustomer = {
      customer_id: customerId,
      first_name: first_name,
      last_name: last_name,
      phone: normalizedPhone,
      email: normalizedEmail,
      registered_at: registeredAt,
    };

    // Add the new customer to the sheet
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const newRow = headers.map((header) => newCustomer[header] || "");
    sheet.appendRow(newRow);

    console.log(`Customer ${customerId} registered successfully`);

    // 4. Return the new customer record
    return {
      success: true,
      customer: newCustomer,
    };
  } catch (error) {
    _logError("registerCustomer", error);
    // console.error("Error registering customer:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generates a unique customer ID
 * @returns {string} Customer ID in format C00001, C00002, etc.
 */
function generateCustomerId() {
  try {
    const sheet = _getCustomersSheetOrThrow();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return "C00001";

    const idColumnIndex = data[0].indexOf("customer_id");
    if (idColumnIndex === -1) throw new Error("Missing 'customer_id' column");

    const ids = data
      .slice(1)
      .map((row) => row[idColumnIndex])
      .filter((id) => /^C\d{5}$/.test(id)); // Only valid IDs

    const maxId = ids.reduce((max, id) => {
      const num = parseInt(id.slice(1), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);

    const nextId = maxId + 1;
    return `C${nextId.toString().padStart(5, "0")}`;
  } catch (error) {
    console.error("Error generating customer ID:", error.message);
    return `C${Date.now().toString().slice(-5)}`;
  }
}
