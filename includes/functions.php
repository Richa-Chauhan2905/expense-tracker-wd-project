<?php
// Common functions for the application

function updateUserProfile($pdo, $user_id, $name, $email, $phone, $password = null) {
    $sql = "UPDATE users SET name = :name, email = :email, phone = :phone";
    $params = [
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':id' => $user_id
    ];
    if (!empty($password)) {
        $sql .= ", password = :password";
        $params[':password'] = $password; // For production, hash the password!
    }
    $sql .= " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute($params);
}
