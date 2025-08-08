/**
 * @fileoverview
 * This script acts as a web app backend for a simple Customer Management System.
 * It handles GET requests to fetch data and POST requests to create or update data.
 * The script is designed to be deployed as a Google Apps Script web app.
 */

/**
 * Handles HTTP GET requests to the web app.
 * This function acts as a router, directing requests based on the 'action'
 * query parameter in the URL.
 *
 * Example Usage:
 * https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=getAllCustomers
 *
 * @param {object} e The event parameter for a web app, containing request data.
 * @param {object} e.parameter The query parameters from the URL.
 * @param {string} e.parameter.action The specific action the client wants to perform.
 * @returns {ContentService.TextOutput} A JSON response containing either the requested data or an error message.
 */
function doGet(e) {
  // Extract the action from the URL query parameters.
  const action = e.parameter.action;
  console.log("Processing GET request. ", `Action: ${action}`);

  try {
    // Use a switch statement to handle different actions.
    switch (action) {
      case "setup":
        // Initialize spreadsheet structure for customer and sales management
        const result = setupSpreadsheets();
        // Return the customer data as a JSON string.
        return ContentService.createTextOutput(
          JSON.stringify({ success: true, result: result }),
        ).setMimeType(ContentService.MimeType.JSON);

      case "getAllCustomers":
        // Fetch all customer records.
        const customers = getAllCustomers();
        // Return the customer data as a JSON string.
        return ContentService.createTextOutput(
          JSON.stringify({ success: true, data: customers }),
        ).setMimeType(ContentService.MimeType.JSON);

      // TODO: Add more cases for other GET actions, e.g., "getCustomerById".

      default:
        // Handle any action that isn't recognized.
        return ContentService.createTextOutput(
          JSON.stringify({
            success: false,
            error: "Unknown or unsupported GET action.",
          }),
        ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    // Catch any unexpected errors during execution and return a generic error message.
    console.log("Unexpected error during execution:", `error: ${err.message}`);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles HTTP POST requests to the web app.
 * This function is used for actions that create or modify data, like registering a new customer.
 * It expects a JSON payload in the request body with 'action' and 'data' properties.
 *
 * @param {object} e The event parameter for a web app, containing request data.
 * @param {string} e.postData.contents The raw string content of the POST request body.
 * @returns {ContentService.TextOutput} A JSON response indicating success or failure.
 */
function doPost(e) {
  let params;

  // The request body (e.postData.contents) is a raw string.
  // It must be parsed into a JavaScript object. This can fail if the request sends malformed JSON.
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    // If JSON parsing fails, return an error indicating an invalid request.
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "Invalid JSON format in request body.",
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Destructure the action and data from the parsed request body.
  const { action, data } = params;

  // Use a switch statement to route the request to the appropriate function.
  try {
    switch (action) {
      case "registerCustomer":
        const result = registerCustomer(data);
        return ContentService.createTextOutput(
          JSON.stringify(result),
        ).setMimeType(ContentService.MimeType.JSON);

      case "updateCustomer":
        const updateResult = updateCustomer(data);
        return ContentService.createTextOutput(
          JSON.stringify(updateResult),
        ).setMimeType(ContentService.MimeType.JSON);

      case "registerSale":
        // Ensure all required fields are present in the 'data' payload
        const { customerId, quantity, amountPaid } = data;
        const saleResult = registerSale(customerId, quantity, amountPaid);
        return ContentService.createTextOutput(
          JSON.stringify(saleResult),
        ).setMimeType(ContentService.MimeType.JSON);

      // TODO: Add more cases for other POST actions, e.g., "createSaleRecord".

      default:
        return ContentService.createTextOutput(
          JSON.stringify({
            success: false,
            error: "Unknown or unsupported POST action.",
          }),
        ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    console.log("Unexpected error during execution:", `error: ${err.message}`);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
