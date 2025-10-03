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
    $expense_id = $_POST['expense_id'] ?? null;
    $date = $_POST['date'] ?? null;
    $category = $_POST['category'] ?? null;
    $item = $_POST['item'] ?? null;
    $amount = $_POST['amount'] ?? null;

    // Debug: Output received data
    error_log("Update expense POST: " . print_r($_POST, true));
    error_log("User ID: $user_id, Expense ID: $expense_id");

    if (!$expense_id || !$date || !$category || !$item || !$amount) {
        http_response_code(400);
        echo "Missing required fields.";
        exit;
    }

    try {
        // Update only if the expense belongs to this user
        $stmt = $pdo->prepare("UPDATE expenses SET date = ?, category = ?, item = ?, amount = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$date, $category, $item, $amount, $expense_id, $user_id]);

        if ($stmt->rowCount() > 0) {
            echo "Expense updated successfully!";
        } else {
            http_response_code(404);
            echo "Expense not found or not owned by this user.";
        }
    } catch (PDOException $e) {
        error_log("DB Error: " . $e->getMessage());
        http_response_code(500);
        echo "DB Error: " . $e->getMessage();
    }
}
?>