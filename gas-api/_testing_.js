function runTest() {
  return;
}

function test_getSalesSheetForMonth(month) {
  const months = ["2025-02", "2025-03", "2025-04", "2025-05", "2025-06"];
  for (const month of months) {
    let sheet = _getSalesSheetForMonth(month);
    console.log(`Sheet for month: ${month} found or created`);
  }
}

// /**
//  * Runs a full suite of tests for customer registration and lookup.
//  */
// function runTest() {
//   // --- Test successful registrations and lookups ---
//   console.log("--- Running Successful Registration Tests ---");
//   testingCustomers(Customer1);
//   testingCustomers(Customer2);
//   testingCustomers(Customer3);
//   testingCustomers(CustomerNoEmail); // Test valid customer with no email

//   // --- Test registrations that are expected to fail ---
//   console.log("\n--- Running Expected Failure Tests ---");
//   testExpectedFailure(CustomerInvalidPhone, "must be 10 digits");
//   testExpectedFailure(CustomerInvalidEmail, "Invalid email format");
//   testExpectedFailure(CustomerMissingPhone, "are required");
//   testExpectedFailure(CustomerDuplicatePhone, "phone number already exists");
//   testExpectedFailure(CustomerDuplicateEmail, "email already exists");
// }

// function testingCustomers(testCustomer) {
//   const customer = __registerCustomerTest(testCustomer);
//   if (!customer) return;

//   __LookupTest(testCustomer, "phone", customer.customer_id);
//   __LookupTest(testCustomer, "email", customer.customer_id);
//   __LookupTest(testCustomer, "customer_id", customer.customer_id);
// }

// /**
//  * Tests that a customer registration fails for a predictable reason.
//  * The test PASSES if registerCustomer returns { success: false }.
//  * @param {Object} testCustomer - The customer data that should cause a failure.
//  * @param {string} expectedErrorPart - A substring of the expected error message.
//  */
// function testExpectedFailure(testCustomer, expectedErrorPart) {
//   console.log(
//     `\n--- Testing Expected Failure for: ${testCustomer.first_name} ---`,
//   );
//   const regResult = registerCustomer(testCustomer);

//   if (!regResult.success) {
//     if (regResult.error && regResult.error.includes(expectedErrorPart)) {
//       console.log(
//         `✅ PASSED: Registration correctly failed with message: "${regResult.error}"`,
//       );
//     } else {
//       console.warn(
//         `⚠️ PASSED but with wrong error: Expected message to include "${expectedErrorPart}", but got "${regResult.error}"`,
//       );
//     }
//   } else {
//     // This is a failure of the test, as the registration should have been blocked.
//     console.error(
//       `❌ FAILED: Invalid customer was registered successfully when it should have failed.`,
//     );
//   }
// }

// const Customer1 = {
//   first_name: "Nathalia",
//   last_name: "Cruz",
//   phone: "3176359773",
//   email: "nathalessthan3@mail.com",
// };

// const Customer2 = {
//   first_name: "Isabel",
//   last_name: "Anacona",
//   phone: "3053831542",
//   email: "isalessthan3@mail.com",
// };

// const Customer3 = {
//   first_name: "Andres",
//   last_name: "Cortes",
//   phone: "3118917668",
//   email: "fcortesbio@mail.com",
// };

// // --- Test customers for expected failures ---

// const CustomerInvalidPhone = {
//   first_name: "John",
//   last_name: "Badphone",
//   phone: "123", // Phone number is not 10 digits
//   email: "badphone@mail.com",
// };

// const CustomerInvalidEmail = {
//   first_name: "Maria",
//   last_name: "Badmail",
//   phone: "5555555555",
//   email: "bad-email-format", // Email format is invalid
// };

// const CustomerMissingPhone = {
//   first_name: "Joe",
//   last_name: "Phoneless",
//   phone: "", // Required field is missing
//   email: "nophone@mail.com",
// };

// // --- Test customers for duplicate entries ---
// // These assume Customer1 and Customer2 have been successfully registered first.

// const CustomerDuplicatePhone = {
//   first_name: "Mateo",
//   last_name: "Usedphone",
//   phone: "3176359773", // Same phone as Customer1
//   email: "new.email@mail.com",
// };

// const CustomerDuplicateEmail = {
//   first_name: "Gustavo",
//   last_name: "Usedmail",
//   phone: "9998887777",
//   email: "isalessthan3@mail.com", // Same email as Customer2
// };

// // --- A valid edge case customer ---

// const CustomerNoEmail = {
//   first_name: "Valentina",
//   last_name: "Veliz",
//   phone: "4443332222",
//   email: "", // Email is optional
// };

// function __registerCustomerTest(testCustomer) {
//   const regResult = registerCustomer(testCustomer);
//   console.log("Register result for", testCustomer.first_name, regResult);
//   if (!regResult.success) {
//     console.warn("Skipping lookup tests for", testCustomer.first_name);
//     return null;
//   }
//   return regResult.customer;
// }

// function __LookupTest(testCustomer, key, expectedId) {
//   let found;

//   switch (key) {
//     case "phone":
//       found = findCustomerByPhone(testCustomer.phone);
//       break;
//     case "email":
//       found = findCustomerByEmail(testCustomer.email);
//       break;
//     case "customer_id":
//       found = findCustomerById(expectedId); // 🔧 FIXED
//       break;
//     default:
//       console.warn("Unsupported lookup key:", key);
//       return;
//   }

//   if (found) {
//     const match = found.customer_id === expectedId;
//     if (match) {
//       console.log(`✅ Lookup by ${key} passed:`, found);
//     } else {
//       console.warn(
//         `⚠️ Lookup by ${key} mismatch: expected ${expectedId}, got ${found.customer_id}`,
//       );
//     }
//   } else {
//     console.error(`❌ Lookup by ${key} failed: no result`);
//   }
// }
