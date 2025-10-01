-- Create Database
CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

-- Users Table with plain text password (FOR DEVELOPMENT ONLY)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    currency_symbol VARCHAR(5) DEFAULT '$',
    monthly_budget DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

INSERT INTO users (name, email, phone, password, currency, currency_symbol, monthly_budget) 
VALUES (
    'John Doe', 
    'john.doe@example.com', 
    '+1234567890', 
    'password123',
    'USD', 
    '$', 
    1000.00
);

DESCRIBE users;

SELECT id, name, email, phone, currency, currency_symbol, monthly_budget, created_at 
FROM users;