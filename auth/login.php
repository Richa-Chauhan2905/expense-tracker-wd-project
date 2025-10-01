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
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    $errors = [];

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Valid email is required";
    }
    if (empty($password)) {
        $errors[] = "Password is required";
    }

    if (empty($errors)) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                // Set session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];

                header('Location: ../dashboard/index.php');
                exit;
            } else {
                $errors[] = "Invalid email or password";
            }
        } catch (PDOException $e) {
            $errors[] = "Login failed: " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - Expenzo</title>
    <link rel="stylesheet" href="auth-style.css">
</head>

<body>
    <div id="loginPage" class="page active">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="brand">
                        <img src="../images/logo.png" alt="Expenzo Logo" class="auth-logo">
                        <h1>Expenzo</h1>
                    </div>
                    <p>Welcome back! Sign in to continue</p>
                </div>

                <?php if (!empty($errors)): ?>
                    <div class="error-message">
                        <?php foreach ($errors as $error): ?>
                            <p><?php echo htmlspecialchars($error); ?></p>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <form id="loginForm" class="auth-form" method="POST" action="">
                    <div class="form-group">
                        <input
                            type="email"
                            id="loginEmail"
                            name="email"
                            placeholder="Email"
                            value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>"
                            required />
                    </div>
                    <div class="form-group">
                        <input
                            type="password"
                            id="loginPassword"
                            name="password"
                            placeholder="Password"
                            required />
                    </div>
                    <button type="submit" class="btn btn-primary">Sign In</button>
                </form>
                <div class="auth-footer">
                    <p>
                        Don't have an account? <a href="signup.php">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div id="notificationContainer"></div>

    <script src="auth-script.js"></script>
</body>

</html>