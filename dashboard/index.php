<?php
session_start();
require_once '../includes/db_connect.php';
require_once '../includes/functions.php';

// Redirect to login if not authenticated
if (!isset($_SESSION['user_id'])) {
    header('Location: ../auth/login.php');
    exit;
}

$user_id = $_SESSION['user_id'];
$user_name = '';
$user_email = '';
$user_phone = '';

// Handle profile update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['profileForm'])) {
    $new_name = trim($_POST['profileName']);
    $new_email = trim($_POST['profileEmail']);
    $new_phone = trim($_POST['profilePhone']);
    $new_password = trim($_POST['profilePassword']);

    // Use the reusable function
    $update_success = updateUserProfile($pdo, $user_id, $new_name, $new_email, $new_phone, $new_password);

    if ($update_success) {
        // Update session
        $_SESSION['user_name'] = $new_name;
        $_SESSION['user_email'] = $new_email;
        $_SESSION['user_phone'] = $new_phone;

        // Set success message
        $_SESSION['profile_update_success'] = true;
    } else {
        // Set error message
        $_SESSION['profile_update_error'] = "Failed to update profile. Please try again.";
    }
}

// Fetch user info from DB
$stmt = $pdo->prepare("SELECT name, email, phone FROM users WHERE id = ?");
$stmt->execute([$user_id]);
if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $user_name = $row['name'];
    $user_email = $row['email'];
    $user_phone = $row['phone'];
    $_SESSION['user_name'] = $user_name;
    $_SESSION['user_email'] = $user_email;
    $_SESSION['user_phone'] = $user_phone;
}

// Check for success/error messages
$profile_update_success = isset($_SESSION['profile_update_success']) ? $_SESSION['profile_update_success'] : false;
$profile_update_error = isset($_SESSION['profile_update_error']) ? $_SESSION['profile_update_error'] : null;

// Clear the messages after reading
unset($_SESSION['profile_update_success']);
unset($_SESSION['profile_update_error']);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Expenzo</title>
    <link rel="stylesheet" href="dashboard-style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>
    <!-- Session data for JavaScript -->
    <div data-session-user_id="<?php echo $_SESSION['user_id']; ?>" style="display: none;"></div>
    <div data-session-user_name="<?php echo htmlspecialchars($_SESSION['user_name']); ?>" style="display: none;"></div>
    <div data-session-user_email="<?php echo htmlspecialchars($_SESSION['user_email']); ?>" style="display: none;"></div>

    <!-- Main App -->
    <div id="mainApp">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <button id="burgerMenu" class="burger-menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div class="brand">
                    <img src="../images/logo.png" alt="Expense Tracker Logo" />
                    <h1 class="app-title">Expenzo</h1>
                </div>
                <div class="user-info">
                    <span id="welcomeUser">Welcome, <?php echo htmlspecialchars($user_name); ?>!</span>
                </div>
            </div>
        </header>

        <!-- Sidebar -->
        <aside id="sidebar" class="sidebar">
            <div class="sidebar-header">
                <h2>Dashboard</h2>
                <button id="closeSidebar" class="close-sidebar">&times;</button>
            </div>
            <nav class="sidebar-nav">
                <a href="#" data-page="home" class="nav-item active">
                    <span class="nav-icon">🏠</span>
                    Home
                </a>
                <a href="#" data-page="manage-expenses" class="nav-item">
                    <span class="nav-icon">💰</span>
                    Manage Expenses
                </a>
                <a href="#" data-page="expense-report" class="nav-item">
                    <span class="nav-icon">📊</span>
                    Expense Report
                </a>
                <a href="#" data-page="profile" class="nav-item">
                    <span class="nav-icon">👤</span>
                    Profile
                </a>
                <a href="#" data-page="contact" class="nav-item">
                    <span class="nav-icon">📧</span>
                    Contact
                </a>
                <a href="#" id="logoutBtn" class="nav-item">
                    <span class="nav-icon">🚪</span>
                    Logout
                </a>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Currency Icon in Top Right -->
            <div class="currency-icon-container">
                <button
                    id="currencyIconBtn"
                    class="currency-icon-btn"
                    aria-label="Select Currency">
                    <span id="currentCurrencyIcon">$</span>
                </button>
            </div>

            <!-- Currency Dialog -->
            <div id="currencyDialog" class="currency-dialog">
                <div class="currency-dialog-content">
                    <div class="currency-dialog-header">
                        <h3>Select Currency</h3>
                        <button id="closeCurrencyDialog" class="close-btn">
                            &times;
                        </button>
                    </div>
                    <div class="currency-options">
                        <div class="currency-option" data-currency="USD" data-symbol="$">
                            <span class="currency-symbol">$</span>
                            <span class="currency-name">USD - US Dollar</span>
                        </div>
                        <div class="currency-option" data-currency="EUR" data-symbol="€">
                            <span class="currency-symbol">€</span>
                            <span class="currency-name">EUR - Euro</span>
                        </div>
                        <div class="currency-option" data-currency="GBP" data-symbol="£">
                            <span class="currency-symbol">£</span>
                            <span class="currency-name">GBP - British Pound</span>
                        </div>
                        <div class="currency-option" data-currency="JPY" data-symbol="¥">
                            <span class="currency-symbol">¥</span>
                            <span class="currency-name">JPY - Japanese Yen</span>
                        </div>
                        <div class="currency-option" data-currency="AUD" data-symbol="A$">
                            <span class="currency-symbol">A$</span>
                            <span class="currency-name">AUD - Australian Dollar</span>
                        </div>
                        <div class="currency-option" data-currency="CAD" data-symbol="C$">
                            <span class="currency-symbol">C$</span>
                            <span class="currency-name">CAD - Canadian Dollar</span>
                        </div>
                        <div class="currency-option" data-currency="CHF" data-symbol="Fr">
                            <span class="currency-symbol">Fr</span>
                            <span class="currency-name">CHF - Swiss Franc</span>
                        </div>
                        <div class="currency-option" data-currency="CNY" data-symbol="¥">
                            <span class="currency-symbol">¥</span>
                            <span class="currency-name">CNY - Chinese Yuan</span>
                        </div>
                        <div class="currency-option" data-currency="INR" data-symbol="₹">
                            <span class="currency-symbol">₹</span>
                            <span class="currency-name">INR - Indian Rupee</span>
                        </div>
                        <div class="currency-option" data-currency="KRW" data-symbol="₩">
                            <span class="currency-symbol">₩</span>
                            <span class="currency-name">KRW - South Korean Won</span>
                        </div>
                        <div class="currency-option" data-currency="SGD" data-symbol="S$">
                            <span class="currency-symbol">S$</span>
                            <span class="currency-name">SGD - Singapore Dollar</span>
                        </div>
                        <div class="currency-option" data-currency="HKD" data-symbol="HK$">
                            <span class="currency-symbol">HK$</span>
                            <span class="currency-name">HKD - Hong Kong Dollar</span>
                        </div>
                        <div class="currency-option" data-currency="NOK" data-symbol="kr">
                            <span class="currency-symbol">kr</span>
                            <span class="currency-name">NOK - Norwegian Krone</span>
                        </div>
                        <div class="currency-option" data-currency="SEK" data-symbol="kr">
                            <span class="currency-symbol">kr</span>
                            <span class="currency-name">SEK - Swedish Krona</span>
                        </div>
                        <div class="currency-option" data-currency="DKK" data-symbol="kr">
                            <span class="currency-symbol">kr</span>
                            <span class="currency-name">DKK - Danish Krone</span>
                        </div>
                        <div class="currency-option" data-currency="PLN" data-symbol="zł">
                            <span class="currency-symbol">zł</span>
                            <span class="currency-name">PLN - Polish Zloty</span>
                        </div>
                        <div class="currency-option" data-currency="CZK" data-symbol="Kč">
                            <span class="currency-symbol">Kč</span>
                            <span class="currency-name">CZK - Czech Koruna</span>
                        </div>
                        <div class="currency-option" data-currency="HUF" data-symbol="Ft">
                            <span class="currency-symbol">Ft</span>
                            <span class="currency-name">HUF - Hungarian Forint</span>
                        </div>
                        <div class="currency-option" data-currency="RUB" data-symbol="₽">
                            <span class="currency-symbol">₽</span>
                            <span class="currency-name">RUB - Russian Ruble</span>
                        </div>
                        <div class="currency-option" data-currency="BRL" data-symbol="R$">
                            <span class="currency-symbol">R$</span>
                            <span class="currency-name">BRL - Brazilian Real</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Home Page -->
            <div id="homePage" class="content-page active">
                <div class="expense-summary">
                    <div class="summary-card">
                        <h3>This Month</h3>
                        <div class="amount" id="thisMonthTotal">$0.00</div>
                    </div>
                    <div class="summary-card">
                        <h3>Last Month</h3>
                        <div class="amount" id="lastMonthTotal">$0.00</div>
                    </div>
                    <div class="summary-card">
                        <h3>Monthly Budget</h3>
                        <div class="budget-container" id="budgetDisplay">
                            <div class="budget-info">
                                <div class="amount" id="monthlyBudget">$0.00</div>
                                <div class="budget-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="budgetProgress"></div>
                                    </div>
                                    <div class="budget-status" id="budgetStatus">
                                        Set your budget
                                    </div>
                                </div>
                            </div>
                            <button
                                id="editBudgetBtn"
                                class="budget-edit-btn"
                                aria-label="Edit Budget">
                                <span>✏️</span>
                            </button>
                        </div>
                        <div class="budget-form" id="budgetForm" style="display: none">
                            <div class="budget-input-row">
                                <input
                                    type="number"
                                    id="budgetInput"
                                    placeholder="Enter monthly budget"
                                    step="0.01"
                                    min="0" />
                                <button id="saveBudgetBtn" class="btn btn-primary">
                                    Save
                                </button>
                                <button id="cancelBudgetBtn" class="btn btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="expense-form-card">
                    <h3>Add New Expense</h3>
                    <form id="expenseForm" class="expense-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="expenseDate">Date</label>
                                <input type="date" id="expenseDate" required />
                            </div>
                            <div class="form-group">
                                <label for="expenseCategory">Category</label>
                                <select id="expenseCategory" required>
                                    <option value="">Select Category</option>
                                    <option value="food">Food & Dining</option>
                                    <option value="transport">Transportation</option>
                                    <option value="shopping">Shopping</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="bills">Bills & Utilities</option>
                                    <option value="health">Health & Medical</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="expenseItem">Item/Description</label>
                                <input
                                    type="text"
                                    id="expenseItem"
                                    placeholder="What did you spend on?"
                                    required />
                            </div>
                            <div class="form-group">
                                <label for="expenseAmount">Amount</label>
                                <div class="amount-upload-row">
                                    <input
                                        type="number"
                                        id="expenseAmount"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required />
                                    <div class="file-upload-container">
                                        <input
                                            type="file"
                                            id="expenseFile"
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                            class="file-input" />
                                        <label for="expenseFile" class="file-upload-btn" title="Upload Receipt/File">
                                            📎
                                        </label>
                                    </div>
                                    <div class="file-upload-status" id="expenseFileStatus"></div>
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Add Expense</button>
                    </form>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h3 id="totalUsers">Loading...</h3>
                        <p>Total Users</p>
                    </div>
                </div>
            </div>

            <!-- Manage Expenses Page -->
            <div id="manage-expensesPage" class="content-page">
                <div class="page-header">
                    <h2>Manage Expenses</h2>
                    <p>View and edit your expenses</p>
                </div>
                <div class="expenses-list">
                    <div class="expenses-header">
                        <h3>Recent Expenses</h3>
                        <div class="filter-controls">
                            <div class="filter-row">
                                <div class="filter-group">
                                    <label for="filterCategory">Category:</label>
                                    <select id="filterCategory">
                                        <option value="">All Categories</option>
                                        <option value="food">Food & Dining</option>
                                        <option value="transport">Transportation</option>
                                        <option value="shopping">Shopping</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="bills">Bills & Utilities</option>
                                        <option value="health">Health & Medical</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label for="filterMonth">Month:</label>
                                    <input
                                        type="month"
                                        id="filterMonth"
                                        placeholder="Select month" />
                                </div>
                                <button id="clearFilters" class="btn btn-secondary">
                                    Clear Filters
                                </button>
                            </div>
                            <div class="filter-help">
                                <small>Select a month to see all expenses for that period</small>
                            </div>
                        </div>
                    </div>
                    <div id="expensesList" class="expenses-container">
                        <!-- Expenses will be populated here by JavaScript -->
                    </div>
                </div>
            </div>

            <!-- Expense Report Page -->
            <div id="expense-reportPage" class="content-page">
                <div class="page-header">
                    <h2>Expense Report</h2>
                    <p>Visual analysis of your spending patterns</p>
                </div>
                <div class="report-container">
                    <div class="chart-card">
                        <h3>Current Month Categories</h3>
                        <div class="chart-container">
                            <canvas id="currentMonthChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <h3>Previous Month Categories</h3>
                        <div class="chart-container">
                            <canvas id="previousMonthChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile Page -->
            <!-- Profile Page -->
            <div id="profilePage" class="content-page">
                <div class="page-header">
                    <h2>Profile</h2>
                    <p>Manage your account information</p>
                </div>

                <?php if ($profile_update_success): ?>
                    <div class="notification success" style="margin: 1rem 0;">
                        Profile updated successfully!
                    </div>
                <?php endif; ?>

                <?php if ($profile_update_error): ?>
                    <div class="notification error" style="margin: 1rem 0;">
                        <?php echo htmlspecialchars($profile_update_error); ?>
                    </div>
                <?php endif; ?>

                <div class="profile-card">
                    <form id="profileForm" class="profile-form" method="post" action="">
                        <input type="hidden" name="profileForm" value="1" />
                        <div class="form-group">
                            <label for="profileName">Full Name</label>
                            <input type="text" id="profileName" name="profileName" value="<?php echo htmlspecialchars($user_name); ?>" required />
                        </div>
                        <div class="form-group">
                            <label for="profileEmail">Email</label>
                            <input type="email" id="profileEmail" name="profileEmail" value="<?php echo htmlspecialchars($user_email); ?>" required />
                        </div>
                        <div class="form-group">
                            <label for="profilePhone">Phone Number</label>
                            <input type="tel" id="profilePhone" name="profilePhone" value="<?php echo htmlspecialchars($user_phone); ?>" placeholder="Enter your phone number" />
                        </div>
                        <div class="form-group">
                            <label for="profilePassword">New Password (leave blank to keep current)</label>
                            <input type="password" id="profilePassword" name="profilePassword" />
                        </div>
                        <button type="submit" class="btn btn-primary">
                            Update Profile
                        </button>
                    </form>
                </div>
            </div>
            <!-- Contact Page -->
            <div id="contactPage" class="content-page">
                <div class="page-header">
                    <h2>Contact Us</h2>
                    <p>Get in touch with our support team</p>
                </div>

                <div class="contact-info">
                    <div class="contact-info-card">
                        <div class="contact-info-item">
                            <span class="contact-icon">📧</span>
                            <div>
                                <h4>Email Support</h4>
                                <p>support@expenz</p>
                                <p>o.com</p>
                            </div>
                        </div>
                        <div class="contact-info-item">
                            <span class="contact-icon">⏰</span>
                            <div>
                                <h4>Response Time</h4>
                                <p>Within 24-48 hours</p>
                            </div>
                        </div>
                        <div class="contact-info-item">
                            <span class="contact-icon">🌍</span>
                            <div>
                                <h4>Available</h4>
                                <p>24/7 Support</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="contact-card">
                    <form id="contactForm" class="contact-form">
                        <div class="form-group">
                            <label for="contactName">Full Name</label>
                            <input type="text" id="contactName" placeholder="Enter your full name" required />
                        </div>
                        <div class="form-group">
                            <label for="contactEmail">Email</label>
                            <input type="email" id="contactEmail" placeholder="Enter your email address" required />
                        </div>
                        <div class="form-group">
                            <label for="contactSubject">Subject</label>
                            <select id="contactSubject" required>
                                <option value="">Select a subject</option>
                                <option value="general">General Inquiry</option>
                                <option value="support">Technical Support</option>
                                <option value="feature">Feature Request</option>
                                <option value="bug">Bug Report</option>
                                <option value="feedback">Feedback</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="contactMessage">Message</label>
                            <textarea id="contactMessage" rows="6" placeholder="Describe your inquiry or issue in detail..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="contactPriority">Priority</label>
                            <select id="contactPriority" required>
                                <option value="">Select priority level</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <span>📤</span>
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </main>
    </div>

    <!-- Modals -->
    <!-- Logout Modal -->
    <div id="logoutModal" class="modal">
        <div class="modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div class="modal-actions">
                <button id="cancelLogout" class="btn btn-secondary">Cancel</button>
                <button id="confirmLogout" class="btn btn-danger">Logout</button>
            </div>
        </div>
    </div>

    <div id="editExpenseModal" class="modal">
        <div class="modal-content">
            <h3>Edit Expense</h3>
            <form id="editExpenseForm" class="expense-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editExpenseDate">Date</label>
                        <input type="date" id="editExpenseDate" required />
                    </div>
                    <div class="form-group">
                        <label for="editExpenseCategory">Category</label>
                        <select id="editExpenseCategory" required>
                            <option value="">Select Category</option>
                            <option value="food">Food & Dining</option>
                            <option value="transport">Transportation</option>
                            <option value="shopping">Shopping</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="bills">Bills & Utilities</option>
                            <option value="health">Health & Medical</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editExpenseItem">Item/Description</label>
                        <input
                            type="text"
                            id="editExpenseItem"
                            placeholder="What did you spend on?"
                            required />
                    </div>
                    <div class="form-group">
                        <label for="editExpenseAmount">Amount</label>
                        <div class="amount-upload-row">
                            <input
                                type="number"
                                id="editExpenseAmount"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required />
                            <div class="file-upload-container">
                                <input
                                    type="file"
                                    id="editExpenseFile"
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                    class="file-input" />
                                <label for="editExpenseFile" class="file-upload-btn" title="Upload Receipt/File">
                                    📎
                                </label>
                            </div>
                            <div class="file-upload-status" id="editExpenseFileStatus"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" id="cancelEdit" class="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Update Expense
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div id="deleteExpenseModal" class="modal">
        <div class="modal-content">
            <h3>Confirm Delete</h3>
            <p>
                Are you sure you want to delete this expense? This action cannot be
                undone.
            </p>
            <div class="modal-actions">
                <button id="cancelDelete" class="btn btn-secondary">Cancel</button>
                <button id="confirmDelete" class="btn btn-danger">
                    Delete Expense
                </button>
            </div>
        </div>
    </div>

    <!-- Overlay -->
    <div id="overlay" class="overlay"></div>

    <script src="dashboard-script.js"></script>
</body>

</html>