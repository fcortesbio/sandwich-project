<?php
require_once "config.php";
require_once "auth.php";

class GASApiWrapper
{
    private $auth;

    public function __construct()
    {
        $this->auth = new Auth();
    }

    public function makeRequest($method, $action, $data = null)
    {
        // Check if user is authenticated
        if (!$this->auth->isLoggedIn()) {
            return ["success" => false, "error" => "Unauthorized"];
        }

        $url = GAS_API_URL;

        if ($method === "GET") {
            $url .= "?action=" . urlencode($action);
            $response = $this->makeGetRequest($url);
        } elseif ($method === "POST") {
            $postData = json_encode(["action" => $action, "data" => $data]);
            $response = $this->makePostRequest($url, $postData);
        } else {
            return ["success" => false, "error" => "Unsupported method"];
        }

        return json_decode($response, true);
    }

    private function makeGetRequest($url)
    {
        $context = stream_context_create([
            "http" => [
                "method" => "GET",
                "header" => "Content-Type: application/json",
                "timeout" => 30,
            ],
        ]);

        return file_get_contents($url, false, $context);
    }

    private function makePostRequest($url, $data)
    {
        $context = stream_context_create([
            "http" => [
                "method" => "POST",
                "header" => "Content-Type: application/json",
                "content" => $data,
                "timeout" => 30,
            ],
        ]);

        return file_get_contents($url, false, $context);
    }

    public function getAllCustomers()
    {
        return $this->makeRequest("GET", "getAllCustomers");
    }

    public function registerCustomer($customerData)
    {
        return $this->makeRequest("POST", "registerCustomer", $customerData);
    }
}

// Handle AJAX requests
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["ajax"])) {
    header("Content-Type: application/json");

    $api = new GASApiWrapper();
    $action = $_POST["action"] ?? "";

    switch ($action) {
        case "getAllCustomers":
            echo json_encode($api->getAllCustomers());
            break;

        case "registerCustomer":
            $customerData = json_decode($_POST["data"] ?? "{}", true);
            echo json_encode($api->registerCustomer($customerData));
            break;

        default:
            echo json_encode(["success" => false, "error" => "Unknown action"]);
    }
    exit();
}
?>
