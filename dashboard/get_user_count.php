<?php
session_start();
require_once '../includes/db_connect.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

try {
    $stmt = $pdo->query("SELECT COUNT(*) as total_users FROM users WHERE is_active = TRUE");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['total_users' => $result['total_users']]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>