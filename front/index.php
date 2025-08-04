<?php
require_once "config.php";
require_once "auth.php";

$auth = new Auth();

// Check if user is already logged in
if ($auth->isLoggedIn()) {
    header("Location: dashboard.php");
    exit();
}

$error = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST["username"] ?? "");
    $password = $_POST["password"] ?? "";

    if (empty($username) || empty($password)) {
        $error = "Please fill in all fields";
    } else {
        $result = $auth->login($username, $password);
        if ($result["success"]) {
            header("Location: dashboard.php");
            exit();
        } else {
            $error = $result["message"];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Management System - Login</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <h1>Customer Management System</h1>
            <p class="subtitle">Please sign in to continue</p>

            <?php if ($error): ?>
                <div class="error-message"><?php echo htmlspecialchars(
                    $error,
                ); ?></div>
            <?php endif; ?>

            <form method="POST" class="login-form">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        value="<?php echo htmlspecialchars(
                            $_POST["username"] ?? "",
                        ); ?>"
                        autocomplete="username"
                    >
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        autocomplete="current-password"
                    >
                </div>

                <button type="submit" class="login-button">Sign In</button>
            </form>

            <div class="login-footer">
                <p>Secure login powered by JWT authentication</p>
            </div>
        </div>
    </div>
</body>
</html>
