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

    if (!$expense_id) {
        http_response_code(400);
        echo "Missing expense ID.";
        exit;
    }

    try {
        // ✅ Only delete if the expense belongs to this user
        $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?");
        $stmt->execute([$expense_id, $user_id]);

        if ($stmt->rowCount() > 0) {
            echo "Expense deleted successfully.";
        } else {
            echo "Expense not found or not owned by this user.";
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo "DB Error: " . $e->getMessage();
    }
}
?>
