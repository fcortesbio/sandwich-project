# 🥪 Sandwich API

*A lightweight, spreadsheet-based sales and customer management system built with Google Apps Script*

---

## 🧠 Overview

**Sandwich API** is a modular, maintainable Google Apps Script project that acts as a lightweight backend (or "spreadsheet API") for managing a small-scale sandwich business. It supports:

* Customer registration with uniqueness validation
* Sale registration with flexible payment tracking
* Monthly ledger partitioning for scalable data growth
* Automatic monthly sales status summarization
* Modular logic separation for easier maintenance and expansion

The system is designed for a non-technical user (e.g., a solo entrepreneur) and integrates cleanly with a mobile or web frontend via Google Apps Script endpoints.

---

## 🧱 Data Architecture

### 1. `customers` (static sheet)
Stores customer records with unique phone/email validation.

| customer_id | first_name | last_name | phone | email | registered_at |
|-------------|------------|-----------|-------|-------|---------------|
| C00001      | John       | Doe       | 555-1234 | john@email.com | 2025-01-15 10:30:00 |

* `customer_id` is auto-generated (C00001, C00002, etc.)
* Email is optional; phone is required and must be unique
* Phone numbers are automatically cleaned (spaces, dashes removed)

### 2. `sales_YYYY_MM` (one sheet per month)
Dynamically generated sales ledger for each calendar month.

| sale_id | customer_id | quantity | unit_price | total_price | amount_paid | pending_balance | status | sale_datetime | last_payment_datetime |
|---------|-------------|----------|------------|-------------|-------------|-----------------|--------|---------------|----------------------|
| S00001  | C00001      | 2        | 5000       | 10000       | 5000        | 5000           | Partial | 2025-01-15 14:30:00 | 2025-01-15 14:30:00 |

* Status is one of: `"Paid"`, `"Partial"`, `"Unpaid"`
* Automatically created at first sale registration in a given month
* `sale_id` is auto-generated per sheet (S00001, S00002, etc.)

### 3. `sales_summary` (meta tracking sheet)
Tracks the *payment status* for each month, helping optimize queries and user interface.

| month | status | last_updated_at |
|-------|--------|-----------------|
| sales_2025_01 | pending | 2025-01-15 14:35:12 |
| sales_2024_12 | settled | 2025-01-01 00:10:00 |

* `status`: `"pending"` if any sale in that sheet has a pending balance, otherwise `"settled"`

---

## 📡 API Endpoints

The Sandwich API provides both POST and GET endpoints for comprehensive functionality.

### Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec
```

---

## 🔄 POST Endpoints

All POST requests should send JSON data with the following structure:
```json
{
  "action": "endpoint_name",
  "data": { /* endpoint-specific data */ }
}
```

### 1. Setup System
**Endpoint:** `setup`
**Description:** Initializes the spreadsheet structure (customers, sales_summary sheets)

**Request:**
```json
{
  "action": "setup"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Spreadsheets setup completed"
}
```

---

### 2. Register Customer
**Endpoint:** `register_customer`
**Description:** Creates a new customer with validation and duplicate checking

**Request:**
```json
{
  "action": "register_customer",
  "data": {
    "first_name": "Maria",
    "last_name": "Garcia",
    "phone": "555-0123",
    "email": "maria@email.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer_id": "C00001",
    "first_name": "Maria",
    "last_name": "Garcia",
    "phone": "5550123",
    "email": "maria@email.com",
    "registered_at": "2025-01-15 10:30:00"
  }
}
```

**Validation Rules:**
- `first_name`, `last_name`, `phone` are required
- `email` is optional
- Phone must be unique across all customers
- Email must be unique if provided

---

### 3. Register Sale
**Endpoint:** `register_sale`
**Description:** Records a new sale with automatic calculations

**Request:**
```json
{
  "action": "register_sale",
  "data": {
    "customer_id": "C00001",
    "quantity": 3,
    "amount_paid": 10000,
    "unit_price": 5000,
    "sale_date": "2025-01-15T14:30:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sale_id": "S00001",
    "customer_id": "C00001",
    "quantity": 3,
    "unit_price": 5000,
    "total_price": 15000,
    "amount_paid": 10000,
    "pending_balance": 5000,
    "status": "Partial",
    "sale_datetime": "2025-01-15 14:30:00",
    "last_payment_datetime": "2025-01-15 14:30:00"
  }
}
```

**Parameters:**
- `customer_id` (required): Must exist in customers sheet
- `quantity` (required): Number of sandwiches (> 0)
- `amount_paid` (optional): Default 0
- `unit_price` (optional): Default 5000
- `sale_date` (optional): Default current date/time

**Status Logic:**
- `"Paid"`: amount_paid >= total_price
- `"Partial"`: 0 < amount_paid < total_price
- `"Unpaid"`: amount_paid = 0

---

### 4. Update Sale Payment
**Endpoint:** `update_sale_payment`
**Description:** Adds additional payment to an existing sale

**Request:**
```json
{
  "action": "update_sale_payment",
  "sale_id": "S00001",
  "additional_payment": 5000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sale_id": "S00001",
    "amount_paid": 15000,
    "pending_balance": 0,
    "status": "Paid",
    "last_payment_datetime": "2025-01-15 16:45:00"
  }
}
```

---

### 5. Update Sales Summary
**Endpoint:** `update_sales_summary`
**Description:** Manually triggers sales summary recalculation

**Request:**
```json
{
  "action": "update_sales_summary"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sales summary updated"
}
```

---

## 📖 GET Endpoints

GET requests use URL parameters:
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec?action=endpoint_name&param=value
```

### 1. Health Check
**Endpoint:** `health`
**Description:** Verifies API is running

**Request:**
```
GET ?action=health
```

**Response:**
```json
{
  "success": true,
  "message": "Sandwich API is running",
  "timestamp": "2025-01-15T14:30:00.000Z"
}
```

---

### 2. Get All Customers
**Endpoint:** `get_all_customers`
**Description:** Retrieves all registered customers

**Request:**
```
GET ?action=get_all_customers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "customer_id": "C00001",
      "first_name": "Maria",
      "last_name": "Garcia",
      "phone": "5550123",
      "email": "maria@email.com",
      "registered_at": "2025-01-15 10:30:00"
    }
  ]
}
```

---

### 3. Find Customer by Phone
**Endpoint:** `find_customer_by_phone`
**Description:** Searches for customer by phone number

**Request:**
```
GET ?action=find_customer_by_phone&phone=555-0123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer_id": "C00001",
    "first_name": "Maria",
    "last_name": "Garcia",
    "phone": "5550123",
    "email": "maria@email.com",
    "registered_at": "2025-01-15 10:30:00"
  }
}
```

**Note:** Returns `null` in data field if customer not found.

---

### 4. Find Customer by Email
**Endpoint:** `find_customer_by_email`
**Description:** Searches for customer by email address

**Request:**
```
GET ?action=find_customer_by_email&email=maria@email.com
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer_id": "C00001",
    "first_name": "Maria",
    "last_name": "Garcia",
    "phone": "5550123",
    "email": "maria@email.com",
    "registered_at": "2025-01-15 10:30:00"
  }
}
```

---

### 5. List Pending Sales
**Endpoint:** `list_pending_sales`
**Description:** Returns all sales with outstanding balances

**Request:**
```
GET ?action=list_pending_sales
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sale_id": "S00001",
      "customer_id": "C00001",
      "quantity": 3,
      "unit_price": 5000,
      "total_price": 15000,
      "amount_paid": 10000,
      "pending_balance": 5000,
      "status": "Partial",
      "sale_datetime": "2025-01-15 14:30:00",
      "last_payment_datetime": "2025-01-15 14:30:00"
    }
  ]
}
```

---

## ⚠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common Error Scenarios:**
- Invalid or missing required parameters
- Duplicate customer phone/email
- Customer not found for sales
- Sale not found for payment updates
- Spreadsheet setup issues

---

## 🚀 Getting Started

### 1. Deploy the Script
1. Create a new Google Apps Script project
2. Copy all `.js` files to your project
3. Deploy as a web app with execute permissions for "Anyone"
4. Copy the deployment URL

### 2. Initialize the System
```bash
curl -X POST "YOUR_DEPLOYMENT_URL" \
  -H "Content-Type: application/json" \
  -d '{"action": "setup"}'
```

### 3. Test the API
```bash
# Register a customer
curl -X POST "YOUR_DEPLOYMENT_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register_customer",
    "data": {
      "first_name": "Test",
      "last_name": "User",
      "phone": "555-TEST",
      "email": "test@example.com"
    }
  }'

# Check health
curl "YOUR_DEPLOYMENT_URL?action=health"
```

---

## 🧪 Testing

Run the built-in test function in Google Apps Script:

```javascript
function testAPI() {
  // This function tests the complete workflow
  // Check the Apps Script logs for results
}
```
---

## 🔧 Configuration

### Default Settings
- **Unit Price:** 5000 (can be overridden per sale)
- **Currency:** Numeric values (no currency formatting)
- **Time Zone:** Uses Google Apps Script session timezone
- **Date Format:** YYYY-MM-DD HH:mm:ss

### Customization
- Modify `unit_price` default in `Sales.js`
- Adjust ID generation patterns in respective files
- Add custom validation rules as needed

---

## 📊 Data Export

Since data is stored in Google Sheets, you can:
- Export to Excel/CSV directly from Google Sheets
- Use Google Sheets API for programmatic access
- Create charts and pivot tables for analysis
- Share sheets with accountants or partners

---

## 🔒 Security Considerations

- Deploy with appropriate access permissions
- Consider adding authentication for production use
- Validate all inputs on the server side
- Monitor usage through Google Apps Script dashboard
- Regular backups via Google Sheets version history

---

## 🛠️ Future Extensions

- **Payment Reminders:** WhatsApp/SMS integration
- **Reporting:** Automated weekly/monthly reports
- **Frontend UI:** HTML Service interface
- **Inventory:** Track sandwich ingredients
- **Multi-location:** Support multiple store locations
- **Analytics:** Customer behavior insights

---

## 📞 Support

For issues or questions:
1. Check Google Apps Script execution logs
2. Verify spreadsheet structure matches expected format
3. Test with the built-in `testAPI()` function
4. Review error messages for specific guidance

---

**Built with ❤️ for small business owners who need simple, effective tools.**
