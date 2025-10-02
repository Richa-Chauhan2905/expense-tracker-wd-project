<?php
session_start();
require_once '../includes/db_connect.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo "Not logged in";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user_id'];
    $date = $_POST['date'] ?? null;
    $category = $_POST['category'] ?? null;
    $item = $_POST['item'] ?? null;
    $amount = $_POST['amount'] ?? null;
    $file_path = isset($_POST['file_path']) ? $_POST['file_path'] : null;

    // Debug: Output received data
    error_log("Add expense POST: " . print_r($_POST, true));
    error_log("User ID: $user_id");

    if (!$date || !$category || !$item || !$amount) {
        http_response_code(400);
        echo "Missing required fields.";
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO expenses (user_id, date, category, item, amount, file_path) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $date, $category, $item, $amount, $file_path]);
        echo "Expense added!";
    } catch (PDOException $e) {
        error_log("DB Error: " . $e->getMessage());
        http_response_code(500);
        echo "DB Error: " . $e->getMessage();
    }
}
?>
