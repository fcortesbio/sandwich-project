function runTest() {
  testingCustomers(Customer1);
  testingCustomers(Customer2);
  testingCustomers(Customer3);
}

function testingCustomers(testCustomer) {
  const customer = __registerCustomerTest(testCustomer);
  if (!customer) return;

  __LookupTest(testCustomer, "phone", customer.customer_id);
  __LookupTest(testCustomer, "email", customer.customer_id);
  __LookupTest(testCustomer, "customer_id", customer.customer_id);
}

const Customer1 = {
  first_name: "Nathalia",
  last_name: "Cruz",
  phone: "3176359773",
  email: "natha.cruz@mail.com",
};

const Customer2 = {
  first_name: "Isabel",
  last_name: "Anacona",
  phone: "3053831542",
  email: "isalessthan3@mail.com",
};

const Customer3 = {
  first_name: "Andres",
  last_name: "Cortes",
  phone: "3118917668",
  email: "fcortesbio@mail.com",
};

function __registerCustomerTest(testCustomer) {
  const regResult = registerCustomer(testCustomer);
  console.log("Register result for", testCustomer.first_name, regResult);
  if (!regResult.success) {
    console.warn("Skipping lookup tests for", testCustomer.first_name);
    return null;
  }
  return regResult.customer;
}

function __LookupTest(testCustomer, key, expectedId) {
  let found;

  switch (key) {
    case "phone":
      found = findCustomerByPhone(testCustomer.phone);
      break;
    case "email":
      found = findCustomerByEmail(testCustomer.email);
      break;
    case "customer_id":
      found = findCustomerById(expectedId); // 🔧 FIXED
      break;
    default:
      console.warn("Unsupported lookup key:", key);
      return;
  }

  if (found) {
    const match = found.customer_id === expectedId;
    if (match) {
      console.log(`✅ Lookup by ${key} passed:`, found);
    } else {
      console.warn(
        `⚠️ Lookup by ${key} mismatch: expected ${expectedId}, got ${found.customer_id}`,
      );
    }
  } else {
    console.error(`❌ Lookup by ${key} failed: no result`);
  }
}
