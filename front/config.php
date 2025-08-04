<?php
// Load Composer autoloader
require_once __DIR__ . "/vendor/autoload.php";

// Database configuration
define(
    "MONGODB_URI",
    "mongodb+srv://fcortesbio:aO9n29pD6zrOHxhZ@pokeserverdb.xwjyej4.mongodb.net/",
);
define("MONGODB_DATABASE", "pokedex-server");

// JWT configuration
define("JWT_SECRET", "your_jwt_secret_key_here"); // Change this to a secure random string
define("JWT_EXPIRY", 3600); // 1 hour in seconds

// Google Apps Script API configuration
define(
    "GAS_API_URL",
    "https://script.google.com/macros/s/AKfycbwIxKfgXOt5zDQ923TpJzD5NfJKTReQZwjtbMFctcoSe_zvmeY2pk0O83WHAFSMlWwF/exec",
);

// Start session
session_start();

// Timezone
date_default_timezone_set("UTC");
?>
