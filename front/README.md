# PHP Customer Management System

A secure PHP-based customer management system that integrates with Google Apps Script API and MongoDB authentication.

## Features

- **Secure Authentication**: JWT-based authentication with MongoDB user storage
- **API Integration**: Secure integration with Google Apps Script API (deployment ID hidden from frontend)
- **Customer Management**: Load and register customers through GAS API
- **Responsive Design**: Clean, modern interface that works on all devices
- **Session Management**: Automatic token validation and session handling

## Setup Instructions

### Prerequisites

1. PHP 7.4+ with MongoDB extension
2. MongoDB cluster with user collection
3. Google Apps Script web app deployed and accessible
4. Web server (Apache/Nginx) with PHP support

### Installation

1. **Upload Files**: Upload all PHP files to your web server

2. **Configure MongoDB Connection**:
   - Edit `config.php`
   - Replace `your_mongodb_connection_string_here` with your MongoDB URI
   - Replace `your_database_name` with your database name

3. **Configure JWT Secret**:
   - Edit `config.php`
   - Replace `your_jwt_secret_key_here` with a secure random string (minimum 32 characters)

4. **Configure Google Apps Script API**:
   - Edit `config.php`
   - Replace `YOUR_DEPLOYMENT_ID` in the GAS_API_URL with your actual deployment ID

5. **Set Permissions**:
   ```bash
   chmod 755 *.php
   chmod 644 *.css *.js
   ```

### MongoDB Extension Installation

If MongoDB extension is not installed:

**Ubuntu/Debian:**
```bash
sudo apt-get install php-mongodb
```

**CentOS/RHEL:**
```bash
sudo yum install php-mongodb
```

**Windows (XAMPP):**
1. Download php_mongodb.dll for your PHP version
2. Copy to PHP extensions directory
3. Add `extension=mongodb` to php.ini

### Security Notes

1. **JWT Secret**: Use a cryptographically secure random string for JWT_SECRET
2. **HTTPS**: Always use HTTPS in production
3. **Database Security**: Ensure MongoDB cluster has proper access controls
4. **API Protection**: The GAS API deployment ID is hidden from the frontend through PHP proxy
5. **Input Validation**: All user inputs are sanitized and validated

### File Structure

```
├── config.php          # Configuration settings
├── auth.php            # Authentication class with JWT handling
├── api.php             # GAS API wrapper (hides deployment ID)
├── index.php           # Login page
├── dashboard.php       # Main application dashboard
├── logout.php          # Logout handler
├── styles.css          # Stylesheet
├── app.js              # Frontend JavaScript
└── README.md           # This file
```

### Usage

1. **Login**: Navigate to the site root and login with MongoDB credentials
2. **Load Customers**: Click "Load All Customers" to fetch data from GAS API
3. **Register Customer**: Use the registration form to add new customers
4. **Logout**: Click logout to end session

### Troubleshooting

1. **MongoDB Connection Issues**:
   - Verify connection string format
   - Check network connectivity to MongoDB cluster
   - Ensure user has proper database permissions

2. **GAS API Issues**:
   - Verify deployment ID is correct
   - Check GAS web app permissions are set to "Anyone"
   - Test API endpoints directly

3. **JWT Issues**:
   - Ensure JWT_SECRET is set and consistent
   - Check system time is synchronized

### API Endpoints

The GAS API should support these endpoints:

- **GET** `?action=getAllCustomers` - Returns list of all customers
- **POST** with JSON body `{"action": "registerCustomer", "data": {...}}` - Registers new customer

### Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Session management
- CSRF protection through proper form handling
- Input sanitization and validation
- API deployment ID hidden from frontend
- Secure HTTP-only session cookies
