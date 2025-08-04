<?php
require_once "config.php";
require_once "auth.php";

$auth = new Auth();

// Check if user is logged in
if (!$auth->isLoggedIn()) {
    header("Location: index.php");
    exit();
}

$username = $_SESSION["username"] ?? "User";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Management Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="dashboard">
        <header class="dashboard-header">
            <div class="header-content">
                <h1>Customer Management Dashboard</h1>
                <div class="user-info">
                    <span>Welcome, <?php echo htmlspecialchars(
                        $username,
                    ); ?></span>
                    <a href="logout.php" class="logout-link">Logout</a>
                </div>
            </div>
        </header>

        <main class="dashboard-main">
            <div class="dashboard-content">
                <div class="action-buttons">
                    <button id="loadCustomers" class="btn btn-primary">Load All Customers</button>
                    <button id="showRegisterForm" class="btn btn-secondary">Register New Customer</button>
                </div>

                <div id="customerRegistration" class="registration-form" style="display: none;">
                    <h3>Register New Customer</h3>
                    <form id="registerForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="customerName">Customer Name</label>
                                <input type="text" id="customerName" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="customerEmail">Email</label>
                                <input type="email" id="customerEmail" name="email" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="customerPhone">Phone</label>
                                <input type="tel" id="customerPhone" name="phone">
                            </div>
                            <div class="form-group">
                                <label for="customerCompany">Company</label>
                                <input type="text" id="customerCompany" name="company">
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-success">Register Customer</button>
                            <button type="button" id="cancelRegister" class="btn btn-cancel">Cancel</button>
                        </div>
                    </form>
                </div>

                <div id="customersContainer" class="customers-container">
                    <div id="loadingMessage" class="loading" style="display: none;">
                        Loading customers...
                    </div>
                    <div id="customersTable"></div>
                </div>

                <div id="messageContainer" class="message-container"></div>
            </div>
        </main>
    </div>

    <script src="app.js"></script>
</body>
</html>
