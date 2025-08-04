<?php
require_once "config.php";

class Auth
{
    private $mongodb;
    private $collection;

    public function __construct()
    {
        try {
            $this->mongodb = new MongoDB\Client(MONGODB_URI);
            $this->collection = $this->mongodb
                ->selectDatabase(MONGODB_DATABASE)
                ->selectCollection("users");
        } catch (Exception $e) {
            error_log("MongoDB connection failed: " . $e->getMessage());
        }
    }

    public function login($username, $password)
    {
        try {
            // Find user by username
            $user = $this->collection->findOne(["username" => $username]);

            if (!$user) {
                return ["success" => false, "message" => "Invalid credentials"];
            }

            // Verify password
            if (!password_verify($password, $user["password"])) {
                return ["success" => false, "message" => "Invalid credentials"];
            }

            // Generate JWT token
            $token = $this->generateJWT($user["_id"], $user["username"]);

            // Store in session
            $_SESSION["user_id"] = (string) $user["_id"];
            $_SESSION["username"] = $user["username"];
            $_SESSION["jwt_token"] = $token;
            $_SESSION["login_time"] = time();

            return [
                "success" => true,
                "token" => $token,
                "user" => [
                    "id" => (string) $user["_id"],
                    "username" => $user["username"],
                    "email" => $user["email"],
                ],
            ];
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            return ["success" => false, "message" => "Login failed"];
        }
    }

    public function generateJWT($userId, $username)
    {
        $header = json_encode(["typ" => "JWT", "alg" => "HS256"]);
        $payload = json_encode([
            "user_id" => (string) $userId,
            "username" => $username,
            "iat" => time(),
            "exp" => time() + JWT_EXPIRY,
        ]);

        $headerEncoded = $this->base64urlEncode($header);
        $payloadEncoded = $this->base64urlEncode($payload);

        $signature = hash_hmac(
            "sha256",
            $headerEncoded . "." . $payloadEncoded,
            JWT_SECRET,
            true,
        );
        $signatureEncoded = $this->base64urlEncode($signature);

        return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
    }

    public function verifyJWT($token)
    {
        $parts = explode(".", $token);
        if (count($parts) !== 3) {
            return false;
        }

        $header = $this->base64urlDecode($parts[0]);
        $payload = $this->base64urlDecode($parts[1]);
        $signature = $this->base64urlDecode($parts[2]);

        $expectedSignature = hash_hmac(
            "sha256",
            $parts[0] . "." . $parts[1],
            JWT_SECRET,
            true,
        );

        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }

        $payloadData = json_decode($payload, true);
        if ($payloadData["exp"] < time()) {
            return false;
        }

        return $payloadData;
    }

    public function isLoggedIn()
    {
        if (!isset($_SESSION["jwt_token"]) || !isset($_SESSION["user_id"])) {
            return false;
        }

        $tokenData = $this->verifyJWT($_SESSION["jwt_token"]);
        return $tokenData !== false;
    }

    public function logout()
    {
        session_destroy();
        return true;
    }

    private function base64urlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), "+/", "-_"), "=");
    }

    private function base64urlDecode($data)
    {
        return base64_decode(
            str_pad(
                strtr($data, "-_", "+/"),
                strlen($data) % 4,
                "=",
                STR_PAD_RIGHT,
            ),
        );
    }
}
?>
