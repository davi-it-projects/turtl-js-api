<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // For testing purposes
header('Access-Control-Allow-Methods: POST');

// Read the raw POST data
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

// Hardcoded valid credentials
$validEmail = "debug@example.com";
$validPassword = "debugpass";

// Check if email and password match
if (isset($data['email']) && isset($data['password'])) {
    if ($data['email'] === $validEmail && $data['password'] === $validPassword) {
        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "data" => [
                "user" => [
                    "id" => 1,
                    "email" => $validEmail,
                    "name" => "Debug User"
                ]
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing email or password"
    ]);
}
