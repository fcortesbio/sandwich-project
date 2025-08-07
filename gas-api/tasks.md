# 📋 Sandwich Project – Task Tracker

This document outlines current, upcoming, and future development tasks for the **Sandwich-API** backend system. It tracks progress across customer and sales modules.

---

## ✅ Completed Tasks (Customers)

- [x] Customer registration system
  - [x] Phone and email normalization/validation
  - [x] Duplicate checking by phone/email
  - [x] Auto-incremented customer ID system (C00001+)
  - [x] Sheet-based persistence via `appendRow()`
- [x] Lookup functions
  - [x] `findCustomerByPhone()`
  - [x] `findCustomerByEmail()`
  - [x] `findCustomerById()`
  - [x] `findCustomerByFullName(first, last)`
- [x] Retrieve all customers (`getAllCustomers()`)
- [x] Tests for registration and lookup logic
- [x] Update customer logic implemented and tested

---

## 🛠️ Immediate Priorities (Sales MVP)

- [ ] **Register Sale Function**
  - [ ] `registerSale(customerId, quantity, amountPaid)`
  - [ ] Check or create monthly sheet (`sales_YYYY_MM`)
  - [ ] Auto-generate `sale_id` (S00001+)
  - [ ] Compute: `total_price`, `pending_balance`, `status`, timestamps
- [ ] **Router Integration**
  - [ ] Add `"registerSale"` to `doPost()`
  - [ ] Parse and forward to `registerSale(...)`

- [ ] **Tests for Sale Registration**
  - [ ] Register fully paid sale
  - [ ] Register partially paid sale
  - [ ] Register unpaid sale
  - [ ] Assert correct status logic

---

## 🔜 Short-Term Objectives (Data Retrieval)

- [ ] `getSalesByCustomerId(customerId)`
  - [ ] Loop over all monthly sales sheets
  - [ ] Return all sales for a customer
- [ ] `getSaleById(saleId)`
  - [ ] Scan all sales sheets
  - [ ] Return matching sale object
- [ ] **Router: Add GET Endpoints**
  - [ ] `?action=getSalesByCustomerId&id=C00001`
  - [ ] `?action=getSaleById&id=S00001`

---

## 📦 Future Enhancements

- [ ] `getMonthlySalesReport(YYYY-MM)`
  - [ ] Total sales, total paid, total pending
  - [ ] Number of sales & unique customers
- [ ] `updateSalePayment(saleId, additionalAmount)`
  - [ ] Update `amount_paid`, `pending_balance`, `status`
  - [ ] Set `last_payment_datetime`
- [ ] `clearSalesSheets()` helper for test cleanup
- [ ] Extract and organize into `SalesTest` suite

---

## 📚 Documentation & Maintenance

- [ ] Document public API contracts (input/output for all endpoints)
- [ ] Expand README to reflect full Customer + Sales coverage
- [ ] Consider splitting files into:
  - `Sales.js`
  - `Customers.js`
  - `Router.js`
  - `Utils.js`

---

## 🧭 Guiding Principles

- Make each module independently testable
- Favor spreadsheet resilience and data integrity
- Make everything callable via `doGet` or `doPost` for future frontend usage
