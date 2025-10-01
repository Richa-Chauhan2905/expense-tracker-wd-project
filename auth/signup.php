<?php
session_start();
require_once '../includes/db_connect.php';

// If user is already logged in, redirect to dashboard
if (isset($_SESSION['user_id'])) {
    header('Location: ../dashboard/index.php');
    exit;
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone']);
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];

    // Validation
    $errors = [];

    if (empty($name)) $errors[] = "Name is required";
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Valid email is required";
    if (empty($phone)) $errors[] = "Phone number is required";
    if (empty($password) || strlen($password) < 6) $errors[] = "Password must be at least 6 characters";
    if ($password !== $confirmPassword) $errors[] = "Passwords do not match";

    if (empty($errors)) {
        try {
            // Check if user already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);

            if ($stmt->fetch()) {
                $errors[] = "User with this email already exists";
            } else {
                // ✅ ADD PASSWORD HASHING HERE
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);

                // Insert new user with hashed password
                $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)");
                $stmt->execute([$name, $email, $phone, $hashed_password]); // Use hashed password

                // Get the newly created user
                $userId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT id, name, email, phone FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                // Set session and redirect
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];

                header('Location: ../dashboard/index.php');
                exit;
            }
        } catch (PDOException $e) {
            $errors[] = "Registration failed: " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - Expenzo</title>
    <link rel="stylesheet" href="auth-style.css">
</head>

<body>
    <div id="signupPage" class="page active">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="brand">
                        <img src="../images/logo.png" alt="Expenzo Logo" class="auth-logo">
                        <h1>Expenzo</h1>
                    </div>
                    <p>Start tracking your expenses today</p>
                </div>

                <?php if (!empty($errors)): ?>
                    <div class="error-message">
                        <?php foreach ($errors as $error): ?>
                            <p><?php echo htmlspecialchars($error); ?></p>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <form id="signupForm" class="auth-form" method="POST" action="">
                    <div class="form-group">
                        <input
                            type="text"
                            id="signupName"
                            name="name"
                            placeholder="Full Name"
                            value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''; ?>"
                            required />
                    </div>
                    <div class="form-group">
                        <input
                            type="email"
                            id="signupEmail"
                            name="email"
                            placeholder="Email"
                            value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>"
                            required />
                    </div>
                    <div class="form-group">
                        <input
                            type="tel"
                            id="signupPhone"
                            name="phone"
                            placeholder="Phone Number"
                            value="<?php echo isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : ''; ?>"
                            required />
                    </div>
                    <div class="form-group">
                        <input
                            type="password"
                            id="signupPassword"
                            name="password"
                            placeholder="Password"
                            required />
                    </div>
                    <div class="form-group">
                        <input
                            type="password"
                            id="signupConfirmPassword"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            required />
                    </div>
                    <button type="submit" class="btn btn-primary">
                        Create Account
                    </button>
                </form>
                <div class="auth-footer">
                    <p>
                        Already have an account? <a href="login.php">Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div id="notificationContainer"></div>

    <script src="auth-script.js"></script>
</body>

</html>