<?php
// Common functions for the application

function updateUserProfile($pdo, $user_id, $name, $email, $phone, $password = null) {
    try {
        $sql = "UPDATE users SET name = :name, email = :email, phone = :phone";
        $params = [
            ':name' => $name,
            ':email' => $email,
            ':phone' => $phone,
            ':id' => $user_id
        ];
        
        if (!empty($password)) {
            $sql .= ", password = :password";
            $params[':password'] = password_hash($password, PASSWORD_DEFAULT); // Hash the password!
        }
        
        $sql .= " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute($params);
        
        return $result && $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        error_log("Profile update error: " . $e->getMessage());
        return false;
    }
}
?>