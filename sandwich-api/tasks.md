# 🧭 Next Steps for Sandwich-API (Customers & Orders)

## ✅ Completed (as of today)
- Customer registration system
  - Phone and email normalization/validation
  - Duplicate checking by phone/email
  - Auto-incremented customer ID system (C00001+)
  - Sheet-based persistence via `appendRow()`
- Lookup functions
  - `findCustomerByPhone()`, `findCustomerByEmail()`, `findCustomerById()`
- Utility helpers for consistent data processing
- Tests for registration and lookups

---

## 🛠️ Immediate Priorities (Tomorrow)
### 1. 🔍 Implement Name-Based Finders
- `findCustomersByFirstName(name)`
- `findCustomersByLastName(name)`
- `findCustomersByFullName(first, last)`
> Consider fuzzy search or partial matches as optional improvements

### 2. 🧪 Write Tests for Name-Based Finders
- Use the same pattern as `__LookupTest()` to verify behavior
- Consider testing case-insensitive matches

---

## 🔜 Short-Term Objectives
### 3. 🛒 Begin Modeling Purchases
- Each purchase will belong to a customer (via `customer_id`)
- Design sheet: `purchases` with columns like:
```

purchase\_id | customer\_id | items | total\_price | purchased\_at

```
- Add `registerPurchase(customerId, items)` function
- Auto-generate `purchase_id` like `P00001`

### 4. 🧠 Define Purchase "Items"
Decide how to represent items:
- Flat string (e.g. `"Sandwich: Jamón, Queso, Pan integral"`)
- Or structured (array or JSON-encoded string)

> Tip: keep this extensible for future pricing logic.

---

## 📈 Future Enhancements
### 5. ✍️ Purchase History Retrieval
- `getPurchasesByCustomerId(id)`
- `getPurchaseById(purchase_id)`

### 6. 📊 Reports & Metrics
- Total number of purchases
- Most active customer
- Most common ingredients / combos (depends on item structure)

---

## 🧪 Optional: Test Management Utilities
- Add a `clearCustomersSheet()` and `clearPurchasesSheet()` for test isolation
- Add test runner with assertions rather than just console logs

---

## 🧱 Codebase Maintenance
- Extract test functions into `CustomersTest.js` (or separate section)
- Document API contracts for each public method

---

## 🔄 Reminders
- Your goal is to make this a modular backend for a real sandwich-ordering platform
- You're iterating toward a Google Apps Script API that can be hit from a frontend (or exposed as REST later)
