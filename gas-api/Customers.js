/**
 * @fileoverview A library of functions for managing customer data in a Google Sheet.
 * This script provides an API to register, find, and validate customer records
 * stored in a sheet named "customers".
 */

// ===  Constants  ===
const NON_DIGITS_REGEX = /\D/g; // Matches all characters that are NOT digits.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validates a standard email structure like name@domain.com
const CUSTOMER_ID_REGEX = /^C\d{5}$/; // Validates if a Customer ID matches the format C+5-digits, e.g., C00001

// ================  Helpers  ================

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
 * Evaluates whether a customer with a customerId already exists in the customersSheet
 * @param {string} customerId
 * @returns {boolean}
 */
function _customerExists(customerId) {
  // We can use the existing `findCustomerById` function
  // to cleanly check for a customer's existence.
  const customer = findCustomerById(customerId);
  // Return true if a customer object was found, otherwise false.
  return !!customer;
}

/**
 * Evaluates whether a customer ID string is in the expected format.
 * NOTE: Corrected a typo here from 'code' to 'customerId'.
 * @private
 * @param {string} customerId - The customer ID to validate.
 * @returns {boolean} True if the format is valid, otherwise false.
 */
function _customerIdIsValid(customerId) {
  return CUSTOMER_ID_REGEX.test(customerId);
}

/**
 * Retrieves the last customer ID from the settings sheet and increments it.
 * Throws an error if the settings sheet or key is not found
 * @private
 * @returns {string} The new unique customer ID (e.g., "C000001")
 */
function _generateNextCustomerId() {
  try {
    const settingsSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("settings");
    if (!settingsSheet) {
      throw new Error("Settings sheet not found. Please run setup first.");
    }

    // Find the row with the last customer ID counter
    const data = settingsSheet.getDataRange().getValues();
    let lastIdNumRow = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === "last_customer_id_number") {
        lastIdNumRow = i;
        break;
      }
    }

    if (lastIdNumRow === -1) {
      throw new Error("Missing 'last_customer_id_number' in settings sheet.");
    }

    // Get the last ID number, increment it, and update the sheet
    const lastIdNum = parseInt(data[lastIdNumRow][1], 10);
    const nextIdNum = lastIdNum + 1;
    settingsSheet.getRange(lastIdNumRow + 1, 2).setValue(nextIdNum);

    return `C${String(nextIdNum).padStart(5, "0")}`;
  } catch (error) {
    _logError("_generateNextCustomerId", error);
    throw new Error("Failed to generate a new customer ID.");
  }
}

/**
 * Private generic helper to find a customer row by a specific column name and value.
 * This version also returns the row index, which is needed for updates.
 * @private
 * @param {string} columnName - The name of the column to search in (e.g., "phone").
 * @param {string|number} value - The value to search for.
 * @returns {{customer: Object, rowIndex: number}|null} The customer object and its 1-based row index if found, otherwise null.
 */
function _findCustomerAndIndexBy(columnName, value) {
  try {
    const sheet = _getCustomersSheetOrThrow();
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Remove headers from data and store them

    const columnIndex = headers.indexOf(columnName);
    if (columnIndex === -1) return null; // Column not found

    const normalizedValue = String(value).trim().toLowerCase();

    // Start from the second row (index 1) since the first is the header.
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const cellValue = String(row[columnIndex]).trim().toLowerCase();
      if (cellValue === normalizedValue) {
        // Return the customer object and the 1-based row index.
        return {
          customer: _rowToCustomerObject(row, headers),
          rowIndex: i + 2, // data array is 0-indexed, so row 1 is index 0. We want the spreadsheet row number, so add 2.
        };
      }
    }
    return null; // Not found
  } catch (error) {
    _logError("_findCustomerAndIndexBy", error);
    return null;
  }
}

/**
 * Private generic helper to find a customer row by a specific column name and value.
 * This returns only the customer object.
 * @private
 * @param {string} columnName - The name of the column to search in (e.g., "phone").
 * @param {string|number} value - The value to search for.
 * @returns {Object|null} The full customer object if found, otherwise null.
 */
function _findCustomerBy(columnName, value) {
  const result = _findCustomerAndIndexBy(columnName, value);
  return result ? result.customer : null;
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
 * @param {string} customerId The customer ID to search for (e.g., "C000001").
 * @returns {Object|null} A customer object if found, otherwise null.
 */
function findCustomerById(customerId) {
  if (!_customerIdIsValid(customerId)) {
    return null;
  }
  return _findCustomerBy("customer_id", customerId);
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
    const customerId = _generateNextCustomerId(); // using the new function
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
 * Updates an existing customer record by their unique customer ID.
 * @param {Object} updateData - The customer data to update. Must include `customer_id`.
 * @param {string} updateData.customer_id - The ID of the customer to update.
 * @param {string} [updateData.first_name] - New first name.
 * @param {string} [updateData.last_name] - New last name.
 * @param {string} [updateData.phone] - New phone number.
 * @param {string} [updateData.email] - New email address.
 * @returns {{success: boolean, customer: Object}|{success: boolean, error: string}} An object with the updated customer record on success, or an error message on failure.
 */
function updateCustomer(updateData) {
  try {
    // 1. Validate that a customer_id is provided.
    const { customer_id } = updateData;
    if (!customer_id) {
      throw new Error("`customer_id` is required for updates.");
    }
    if (!_customerIdIsValid(customer_id)) {
      console.log("Invalid format for `customer_id`");
      throw new Error("Invalid format for `customer_id`");
    }

    // 2. Find the customer's row index.
    const customerRecord = _findCustomerAndIndexBy("customer_id", customer_id);
    if (!customerRecord) {
      throw new Error(`Customer with ID '${customer_id}' not found.`);
    }

    const sheet = _getCustomersSheetOrThrow();
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const { customer, rowIndex } = customerRecord;

    // 3. Process and validate the new data, checking for duplicates.
    const updatedCustomer = { ...customer }; // Create a copy of the existing customer data.

    // Handle each potential update field.
    for (const key in updateData) {
      const value = updateData[key];
      if (key === "customer_id" || value === undefined || value === null) {
        continue; // Skip the ID and null/undefined values.
      }

      switch (key) {
        case "first_name":
        case "last_name":
          updatedCustomer[key] = value.trim();
          break;
        case "phone":
          const phoneValidation = _phoneValidator(value);
          if (!phoneValidation.success) {
            throw new Error("Phone number must be 10 digits.");
          }
          const duplicatePhone = findCustomerByPhone(phoneValidation.value);
          // Check for a duplicate phone that doesn't belong to the current customer.
          if (duplicatePhone && duplicatePhone.customer_id !== customer_id) {
            throw new Error(
              `Phone number '${phoneValidation.value}' already exists.`,
            );
          }
          updatedCustomer[key] = phoneValidation.value;
          break;
        case "email":
          const emailValidation = _emailValidator(value);
          if (!emailValidation.success) {
            throw new Error("Invalid email format.");
          }
          const duplicateEmail = findCustomerByEmail(emailValidation.value);
          // Check for a duplicate email that doesn't belong to the current customer.
          if (duplicateEmail && duplicateEmail.customer_id !== customer_id) {
            throw new Error(`Email '${emailValidation.value}' already exists.`);
          }
          updatedCustomer[key] = emailValidation.value;
          break;
        default:
          // Ignore any other unknown keys in the update payload.
          console.warn(`Attempted to update unknown key: ${key}`);
          break;
      }
    }

    // 4. Update the spreadsheet row with the new values.
    const newRowData = headers.map((header) => updatedCustomer[header] || "");
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRowData]);

    console.log(`Customer ${customer_id} updated successfully.`);

    return { success: true, customer: updatedCustomer };
  } catch (error) {
    _logError("updateCustomer", error);
    return { success: false, error: error.message };
  }
}
