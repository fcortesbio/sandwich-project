# Sandwich API
A REST-API-like Google AppsScripts implementation to help Natha with her entrepreneurship.

## Structure

`customers` → sheet with all customers.

`sales_summary` → Monthly statement sheet (marks months as "settled" or "pending").

`sales_YYYY_MM` → dynamically generated sheets for each month where sales are recorded.

## Tasks:

* `setupSpreadsheets()` → creates `customers` sheet and y `sales_summary` if they don't exist.

* `createMonthSalesSheet(date)` → creates a sheet `sales_YYYY_MM` with headers, if they don't exist.

* `getMonthSalesSheet(fecha)` → return a month's sales sheet, triggers sheet creation if not found.

* `updateSalesSummary()` → scan all sheets `sales_YYYY_MM`, and marks in `sales_summary` whether the month is "pending" or "settled" (depending on the existence of sells with pending balance.

* Helpers for names and header generations

---
