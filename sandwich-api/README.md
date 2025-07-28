# **Sandwich API**
A REST-API-like Google AppsScripts implementation to help Natha with her entrepreneurship.

## Source Document Structure

`customers` → sheet with all customers.

`sales_summary` → Monthly statement sheet (marks months as "settled" or "pending").

`sales_YYYY_MM` → dynamically generated sheets for each month where sales are recorded.

## **Script structure**:
```bash
/sandwich-api
├── appsscript.json
├── Code.gs                  # calls setup and holds shared utilities
├── Customers.gs             # Customer registration, lookup, validation
├── Sales.gs                 # Sales logic, sale registration, pending calculation
├── Summary.gs               # Monthly summary and update logic
└── Router.gs                # Exposes public functions as endpoints
```

## **Functions reference**:

### *setupSpreadsheets()*

* **Purpose**: Initializes the spreadsheet for first-time use.

* **Actions**:

  * Checks if the `customers` and `sales_summary` sheets exist. If they don't, it creates them and adds a header row to each.

  * Checks for the default Sheet1 and deletes it to keep the spreadsheet clean.


### *getMonthlySalesSheetName(date)*

* **Purpose**: Creates a standardized sheet name for a given month's sales.

* **Action**: Takes a Date object (defaulting to the current date) and returns a string in the format `sales_YYYY_MM` (e.g., sales_2025_07).

### *createMonthSalesSheet(date)*

* **Purpose**: Creates a new sheet for a specific month's sales if one doesn't already exist.

* **Actions**:

  * Generates the monthly sheet name using *getMonthlySalesSheetName()*.

  * If no sheet with that name exists, it creates one and adds a detailed header row for tracking individual sales.

### *getMonthSalesSheet(date)*

* **Purpose**: A reliable way to get the sales sheet for a specific month.

* **Actions**:

  * It first tries to find the sales sheet for the given month.

  * If the sheet doesn't exist, it calls `createMonthSalesSheet()` to create it first, and then returns it. This ensures we always get a valid sheet object back.

### *updateSalesSummary()*

* **Purpose**: To scan all monthly sales sheets and update the sales_summary sheet with the current status of each month.

* **Actions**:

  * Iterates through all sheets in the spreadsheet, looking for ones that match the `sales_YYYY_MM` format.

  * For each monthly sales sheet, it checks if any row has a value greater than 0 in the pending_balance column.

  * Based on this, it determines if the month's status is pending or settled.

  * Finally, it clears the old data in sales_summary and repopulates it with the fresh status for each month.


## Tasks:
### registerCustomer();
* Validate uniqueness by phone (or email if present).

* Auto-generate customer_id.

### *registerSale(customer_id, quantity, amount_paid)*

* Look up or create monthly sheet.

* Calculate totals, determine status, add timestamp.

### *listPendingSales()*

* Consult only months marked "pending" in sales_summary.
