/**
 * Customer Management Functions
 * Handles customer registration, lookup, and validation
 */

// normalizedPhone = phone.replace(/[\s\-\(\)]/g, "").trim();
function phoneValidator(phone) {
  // 1. Return a failure object if the input is invalid
  if (!phone || typeof phone !== "string") {
    return { success: false, value: null };
  }

  // 2. Remove all non-digit characters
  let digitsOnly = phone.replace(/\D/g, "");

  // 3. Handle the optional "1" country code
  if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    digitsOnly = digitsOnly.substring(1);
  }

  // 4. Return the appropriate object based on validation
  if (digitsOnly.length === 10) {
    return { success: true, value: digitsOnly };
  } else {
    return { success: false, value: null };
  }
}

function emailValidator(email) {
  // 1. Return a failure object if the input is invalid
  if (!email || typeof email !== "string") {
    return { success: false, value: null };
  }
  // 2. trim whitespaces for cleaner validation
  const trimmedEmail = email.trim();

  // 3. Test against the regular expression
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(trimmedEmail);

  return isValid
    ? { success: true, value: trimmedEmail }
    : { success: false, value: null };
}

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
    // 1. Validate input
    if (!first_name || !last_name || !phone) {
      //|| !email : no longer enforcing email as required input
      throw new Error(
        "Fields 'first_name', 'last_name', and 'phone' are required",
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate phone format (basic validation)
    // deprecating: using validator function phoneValidator()
    // const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    // if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""))) {
    //   throw new Error("Invalid phone number format");
    // }
    const phoneValidation = phoneValidator(phone);
    if (!phoneValidation.success) {
      throw new Error("Phone number must be 10 digits");
    }

    // 2. Check for duplicates by phone or email
    const existingByPhone = findCustomerByPhone(phone);
    if (existingByPhone) {
      throw new Error("Customer with this phone number already exists");
    }

    if (email) {
      const existingByEmail = findCustomerByEmail(email);
      if (existingByEmail) {
        throw new Error("Customer with this email already exists");
      }
    }

    // 3. Create new row with generated customer_id and timestamp
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const customersSheet = ss.getSheetByName("customers");

    if (!customersSheet) {
      throw new Error(
        "Customers sheet not found. Please run setupSpreadsheets() first.",
      );
    }

    const customerId = generateCustomerId();
    const registeredAt = new Date().toISOString();

    const newCustomer = {
      customer_id: customerId,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      registered_at: registeredAt,
    };

    // Add the new customer to the sheet
    customersSheet.appendRow([
      newCustomer.customer_id,
      newCustomer.first_name,
      newCustomer.last_name,
      newCustomer.phone,
      newCustomer.email,
      newCustomer.registered_at,
    ]);

    console.log(`Customer ${customerId} registered successfully`);

    // 4. Return the new customer record
    return {
      success: true,
      customer: newCustomer,
    };
  } catch (error) {
    console.error("Error registering customer:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Finds a customer by phone number
 * @param {string} phone - Phone number to search for
 * @returns {Object|null} Customer record if found, null otherwise
 */
function findCustomerByPhone(phone) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const customersSheet = ss.getSheetByName("customers");

    if (!customersSheet) {
      return null;
    }

    const data = customersSheet.getDataRange().getValues();
    const headers = data[0];

    // Find the phone column index
    const phoneIndex = headers.indexOf("phone");
    if (phoneIndex === -1) {
      return null;
    }

    // Search for the phone number (skip header row)
    for (let i = 1; i < data.length; i++) {
      if (data[i][phoneIndex] === phone.trim()) {
        // Return customer object
        return {
          customer_id: data[i][0],
          first_name: data[i][1],
          last_name: data[i][2],
          phone: data[i][3],
          email: data[i][4],
          registered_at: data[i][5],
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding customer by phone:", error.message);
    return null;
  }
}

/**
 * Finds a customer by email address
 * @param {string} email - Email address to search for
 * @returns {Object|null} Customer record if found, null otherwise
 */
function findCustomerByEmail(email) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const customersSheet = ss.getSheetByName("customers");

    if (!customersSheet) {
      return null;
    }

    const data = customersSheet.getDataRange().getValues();
    const headers = data[0];

    // Find the email column index
    const emailIndex = headers.indexOf("email");
    if (emailIndex === -1) {
      return null;
    }

    // Search for the email (case-insensitive, skip header row)
    const searchEmail = email.trim().toLowerCase();
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailIndex].toLowerCase() === searchEmail) {
        // Return customer object
        return {
          customer_id: data[i][0],
          first_name: data[i][1],
          last_name: data[i][2],
          phone: data[i][3],
          email: data[i][4],
          registered_at: data[i][5],
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding customer by email:", error.message);
    return null;
  }
}

/**
 * Generates a unique customer ID
 * @returns {string} Customer ID in format C00001, C00002, etc.
 */
function generateCustomerId() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const customersSheet = ss.getSheetByName("customers");

    if (!customersSheet) {
      return "C00001"; // First customer if sheet doesn't exist
    }

    // Get the number of existing customers (excluding header)
    const lastRow = customersSheet.getLastRow();
    const customerCount = Math.max(0, lastRow - 1);

    // Generate next customer ID
    const nextId = customerCount + 1;
    return `C${nextId.toString().padStart(5, "0")}`;
  } catch (error) {
    console.error("Error generating customer ID:", error.message);
    // Fallback to timestamp-based ID
    return `C${Date.now().toString().slice(-5)}`;
  }
}

/**
 * Gets all customers from the spreadsheet
 * @returns {Array} Array of customer objects
 */
function getAllCustomers() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const customersSheet = ss.getSheetByName("customers");

    if (!customersSheet) {
      return [];
    }

    const data = customersSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return []; // No customers (only header or empty)
    }

    // Convert rows to customer objects (skip header)
    const customers = [];
    for (let i = 1; i < data.length; i++) {
      customers.push({
        customer_id: data[i][0],
        first_name: data[i][1],
        last_name: data[i][2],
        phone: data[i][3],
        email: data[i][4],
        registered_at: data[i][5],
      });
    }

    return customers;
  } catch (error) {
    console.error("Error getting all customers:", error.message);
    return [];
  }
}

/**
 * Finds a customer by customer ID
 * @param {string} customerId - Customer ID to search for
 * @returns {Object|null} Customer record if found, null otherwise
 */
function findCustomerById(customerId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const customersSheet = ss.getSheetByName("customers");

    if (!customersSheet) {
      return null;
    }

    const data = customersSheet.getDataRange().getValues();

    // Search for the customer ID (skip header row)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === customerId) {
        return {
          customer_id: data[i][0],
          first_name: data[i][1],
          last_name: data[i][2],
          phone: data[i][3],
          email: data[i][4],
          registered_at: data[i][5],
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding customer by ID:", error.message);
    return null;
  }
}
