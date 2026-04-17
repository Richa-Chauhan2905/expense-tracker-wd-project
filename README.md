# Expense Tracker

## 📋 Project Overview
The Expense Tracker is a comprehensive web application designed to help users efficiently manage and track their expenses. It provides a user-friendly interface for recording daily expenses, categorizing spending, setting budgets, and analyzing financial patterns through an intuitive dashboard.

## ✨ Features
- **User Authentication**: Secure signup and login system
- **Dashboard**: Visual overview of expenses and budget status
- **Expense Management**: Add, edit, delete, and categorize expenses
- **Category Support**: Organize expenses by custom categories
- **Budget Tracking**: Set monthly budgets and monitor spending
- **Multi-currency Support**: Support for different currencies and symbols
- **Expense Reports**: View spending trends and patterns
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **File Upload**: Attach receipts or documents to expenses
- **User Profile**: Manage personal settings and preferences

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP
- **Database**: MySQL
- **Authentication**: Session-based authentication
- **Server**: Apache/PHP server

## 📁 Folder Structure
```
expense-tracker-wd-project/
│
├── auth/                 # Authentication related files
│   ├── login.php        # Login page
│   ├── signup.php       # Registration page
│   └── logout.php       # Logout functionality
│
├── dashboard/           # Dashboard related files
│   ├── index.php        # Main dashboard page
│   └── stats.php        # Statistics and reports
│
├── includes/            # Reusable PHP files
│   ├── config.php       # Database configuration
│   ├── db_connect.php   # Database connection
│   └── functions.php    # Helper functions
│
├── images/              # Image assets
│   └── [project images]
│
├── users_table.sql      # Database schema
└── README.md           # Project documentation
```

## 🗄️ Database Schema

### Users Table
```sql
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
```

### Expenses Table
```sql
CREATE TABLE IF NOT EXISTS expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    item VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🚀 Setup Instructions

### Prerequisites
- PHP 7.0 or higher
- MySQL Server
- Apache Server or any PHP-compatible web server
- Git

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Richa-Chauhan2905/expense-tracker-wd-project.git
   cd expense-tracker-wd-project
   ```

2. **Setup Database**
   - Create a new MySQL database or use existing one
   - Run the SQL file to create tables:
   ```bash
   mysql -u root -p expense_tracker < users_table.sql
   ```

3. **Configure Database Connection**
   - Navigate to `includes/config.php` or `includes/db_connect.php`
   - Update the following credentials:
   ```php
   $host = "localhost";
   $user = "root";
   $password = "your_password";
   $database = "expense_tracker";
   ```

4. **Place Files in Web Server**
   - Copy the project folder to your web server's root directory (htdocs for XAMPP, www for WAMP)
   
5. **Access the Application**
   - Open your browser and navigate to:
   ```
   http://localhost/expense-tracker-wd-project
   ```

## 💡 Usage Guide

### Getting Started
1. **Register**: Click on the signup link and create a new account with your email
2. **Login**: Use your credentials to log in to the application
3. **Set Budget**: Go to settings and set your monthly budget and preferred currency

### Adding Expenses
1. Navigate to the dashboard
2. Click "Add Expense" button
3. Fill in the following details:
   - **Date**: Date of the expense
   - **Category**: Select or create category
   - **Item/Description**: Brief description of expense
   - **Amount**: Expense amount
   - **Receipt**: (Optional) Upload receipt image or document

### Viewing Reports
- Dashboard shows current month expenses
- View spending by category
- Monitor progress against monthly budget
- Export expense data (if available)

### Managing Settings
- Update profile information
- Change password
- Set currency preference
- Modify monthly budget

## 🔑 Key Features Explained

### Authentication
- Secure login and registration system
- Email-based unique identification
- Session management for user security

### Dashboard
- Real-time expense overview
- Budget vs. spending comparison
- Expense breakdown by category
- Recent transactions list

### Expense Tracking
- Add expenses with multiple details
- Edit/update existing expenses
- Delete unnecessary entries
- Filter by date range and category

### Budget Management
- Set custom monthly budgets
- Real-time budget tracking
- Alerts for budget overages
- Track spending trends

## 📊 API Endpoints (If applicable)

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout

### Expenses
- `GET /dashboard/` - Get all expenses
- `POST /dashboard/` - Add new expense
- `PUT /dashboard/` - Update expense
- `DELETE /dashboard/` - Delete expense

## 🤝 Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License
This project is open source and available under the MIT License.

## 👤 Author
**Richa Chauhan**
- GitHub: [@Richa-Chauhan2905](https://github.com/Richa-Chauhan2905)

## 📧 Support
For issues, questions, or suggestions, please open an issue on the GitHub repository.

## 📅 Project Timeline
- **Created**: October 1, 2025
- **Last Updated**: 2026-04-17 06:43:05
- **Current Date**: April 17, 2026

---

**Happy Tracking! 💰**