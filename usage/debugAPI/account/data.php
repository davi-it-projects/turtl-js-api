<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // For testing purposes
header('Access-Control-Allow-Methods: GET');

// Hardcoded user data
$userData = [
  "id" => 1,
  "email" => "debug@example.com",
  "name" => "Debug User",
];
echo json_encode([
  "success" => true,
  "message" => "User data retrieved successfully",
  "data" => [
    "user" => $userData,
  ],
]);