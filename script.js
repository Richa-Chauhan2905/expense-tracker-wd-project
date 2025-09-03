// Application State
let currentUser = null;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let currentPage = "home";
let currentCurrency = localStorage.getItem("currentCurrency") || "USD";
let currentCurrencySymbol =
  localStorage.getItem("currentCurrencySymbol") || "$";
let currentEditingExpenseId = null;
let currentDeletingExpenseId = null;
let monthlyBudget = parseFloat(localStorage.getItem("monthlyBudget")) || 0;

// Category colors for charts
const categoryColors = {
  food: "#F59E0B",
  transport: "#3B82F6",
  shopping: "#8B5CF6",
  entertainment: "#EF4444",
  bills: "#10B981",
  health: "#EC4899",
  other: "#6B7280",
};

// DOM Elements
const elements = {
  // Pages
  loginPage: document.getElementById("loginPage"),
  signupPage: document.getElementById("signupPage"),
  mainApp: document.getElementById("mainApp"),

  // Auth forms
  loginForm: document.getElementById("loginForm"),
  signupForm: document.getElementById("signupForm"),
  showSignup: document.getElementById("showSignup"),
  showLogin: document.getElementById("showLogin"),

  // Navigation
  burgerMenu: document.getElementById("burgerMenu"),
  sidebar: document.getElementById("sidebar"),
  closeSidebar: document.getElementById("closeSidebar"),
  overlay: document.getElementById("overlay"),

  // Content pages
  contentPages: document.querySelectorAll(".content-page"),
  navItems: document.querySelectorAll(".nav-item"),

  // Forms
  expenseForm: document.getElementById("expenseForm"),
  addExpenseForm: document.getElementById("addExpenseForm"),
  profileForm: document.getElementById("profileForm"),

  // Lists and displays
  expensesList: document.getElementById("expensesList"),
  welcomeUser: document.getElementById("welcomeUser"),

  // Summary
  thisMonthTotal: document.getElementById("thisMonthTotal"),
  lastMonthTotal: document.getElementById("lastMonthTotal"),
  monthlyBudget: document.getElementById("monthlyBudget"),

  // Charts
  currentMonthChart: document.getElementById("currentMonthChart"),
  previousMonthChart: document.getElementById("previousMonthChart"),

  // Stats
  currentMonthStat: document.getElementById("currentMonthStat"),
  previousMonthStat: document.getElementById("previousMonthStat"),
  differenceStat: document.getElementById("differenceStat"),

  // Modal
  logoutModal: document.getElementById("logoutModal"),
  logoutBtn: document.getElementById("logoutBtn"),
  confirmLogout: document.getElementById("confirmLogout"),
  cancelLogout: document.getElementById("cancelLogout"),

  // Filters
  filterCategory: document.getElementById("filterCategory"),
};

// Initialize Application
function init() {
  // Check if user is logged in
  currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (currentUser) {
    showMainApp();
  } else {
    showLoginPage();
  }

  setupEventListeners();
  setCurrentDate();
}

// Event Listeners
function setupEventListeners() {
  // Auth
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.signupForm.addEventListener("submit", handleSignup);
  elements.showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    showSignupPage();
  });
  elements.showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    showLoginPage();
  });

  // Navigation
  elements.burgerMenu.addEventListener("click", toggleSidebar);
  elements.closeSidebar.addEventListener("click", closeSidebar);
  elements.overlay.addEventListener("click", closeSidebar);

  // Navigation items
  elements.navItems.forEach((item) => {
    item.addEventListener("click", handleNavigation);
  });

  // Forms
  elements.expenseForm.addEventListener("submit", handleAddExpense);
  elements.addExpenseForm.addEventListener("submit", handleAddExpense);
  elements.profileForm.addEventListener("submit", handleUpdateProfile);
  
  // Contact form
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit);
  }

  // Modal
  elements.logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showLogoutModal();
  });
  elements.confirmLogout.addEventListener("click", handleLogout);
  elements.cancelLogout.addEventListener("click", hideLogoutModal);

  // Filters
  if (elements.filterCategory) {
    elements.filterCategory.addEventListener("change", filterExpenses);
  }

  const filterMonth = document.getElementById("filterMonth");
  const clearFiltersBtn = document.getElementById("clearFilters");

  if (filterMonth) {
    filterMonth.addEventListener("change", filterExpenses);
  }
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearFilters);
  }

  // CRUD Operations
  const editExpenseForm = document.getElementById("editExpenseForm");
  const cancelEdit = document.getElementById("cancelEdit");
  const confirmDelete = document.getElementById("confirmDelete");
  const cancelDelete = document.getElementById("cancelDelete");

  if (editExpenseForm) {
    editExpenseForm.addEventListener("submit", handleEditExpense);
  }
  if (cancelEdit) {
    cancelEdit.addEventListener("click", hideEditExpenseModal);
  }
  if (confirmDelete) {
    confirmDelete.addEventListener("click", confirmDeleteExpense);
  }
  if (cancelDelete) {
    cancelDelete.addEventListener("click", hideDeleteExpenseModal);
  }

  // Budget functionality
  const editBudgetBtn = document.getElementById("editBudgetBtn");
  const saveBudgetBtn = document.getElementById("saveBudgetBtn");
  const cancelBudgetBtn = document.getElementById("cancelBudgetBtn");

  if (editBudgetBtn) {
    editBudgetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showBudgetForm();
    });
  }
  if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener("click", saveBudget);
  }
  if (cancelBudgetBtn) {
    cancelBudgetBtn.addEventListener("click", hideBudgetForm);
  }

  // Currency icon button and dialog
  const currencyIconBtn = document.getElementById("currencyIconBtn");
  const currencyDialog = document.getElementById("currencyDialog");
  const closeCurrencyDialog = document.getElementById("closeCurrencyDialog");

  if (currencyIconBtn) {
    currencyIconBtn.addEventListener("click", () => {
      currencyDialog.classList.add("active");
    });
  }

  if (closeCurrencyDialog) {
    closeCurrencyDialog.addEventListener("click", () => {
      currencyDialog.classList.remove("active");
    });
  }

  // Close dialog when clicking outside
  if (currencyDialog) {
    currencyDialog.addEventListener("click", (e) => {
      if (e.target === currencyDialog) {
        currencyDialog.classList.remove("active");
      }
    });

    // Add event listeners to currency options
    const currencyOptions = currencyDialog.querySelectorAll(".currency-option");
    currencyOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const currency = option.getAttribute("data-currency");
        const symbol = option.getAttribute("data-symbol");

        // Update current currency
        currentCurrency = currency;
        currentCurrencySymbol = symbol;

        // Save to localStorage
        localStorage.setItem("currentCurrency", currentCurrency);
        localStorage.setItem("currentCurrencySymbol", currentCurrencySymbol);

        // Update display
        updateCurrencyDisplay();
        updateDashboard();
        renderExpensesList();

        // Update charts if on expense report page
        if (currentPage === "expense-report") {
          renderCharts();
        }

        // Close dialog
        currencyDialog.classList.remove("active");

        // Show notification
        showNotification(`Currency changed to ${currency}`, "success");
      });
    });

    // Set initial currency display
    updateCurrencyDisplay();
  }

  // File preview modal
  const closeFilePreview = document.getElementById("closeFilePreview");
  if (closeFilePreview) {
    closeFilePreview.addEventListener("click", () => {
      document.getElementById("filePreviewModal").classList.remove("active");
      document.getElementById("overlay").classList.remove("active");
    });
  }

  // File upload status handling
  setupFileUploadStatus();
}

// Authentication Functions
function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    showMainApp();
    showNotification("Login successful!", "success");
  } else {
    showNotification("Invalid email or password", "error");
  }
}

function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const phone = document.getElementById("signupPhone").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById(
    "signupConfirmPassword"
  ).value;

  if (password !== confirmPassword) {
    showNotification("Passwords do not match", "error");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some((u) => u.email === email)) {
    showNotification("User already exists", "error");
    return;
  }

  const newUser = { name, email, phone, password };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  currentUser = newUser;
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  showMainApp();
  showNotification("Account created successfully!", "success");
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  hideLogoutModal();
  showLoginPage();
  showNotification("Logged out successfully", "success");
}

// Page Navigation
function showLoginPage() {
  elements.loginPage.classList.add("active");
  elements.signupPage.classList.remove("active");
  elements.mainApp.classList.remove("active");
}

function showSignupPage() {
  elements.signupPage.classList.add("active");
  elements.loginPage.classList.remove("active");
  elements.mainApp.classList.remove("active");
}

function showMainApp() {
  elements.mainApp.classList.add("active");
  elements.loginPage.classList.remove("active");
  elements.signupPage.classList.remove("active");

  if (currentUser) {
    elements.welcomeUser.textContent = `Welcome, ${currentUser.name}!`;
    loadProfile();
  }

  updateCurrencyDisplay();
  updateDashboard();
  renderExpensesList();
}

function handleNavigation(e) {
  e.preventDefault();

  const page = e.target.getAttribute("data-page");
  if (!page) return;

  // Update active nav item
  elements.navItems.forEach((item) => item.classList.remove("active"));
  e.target.classList.add("active");

  // Show corresponding content page
  showContentPage(page);
  closeSidebar();
}

function showContentPage(page) {
  elements.contentPages.forEach((contentPage) =>
    contentPage.classList.remove("active")
  );

  // Handle different page naming conventions
  let pageElement;
  switch (page) {
    case "home":
      pageElement = document.getElementById("homePage");
      break;
    case "manage-expenses":
      pageElement = document.getElementById("manageExpensesPage");
      break;
    case "expense-report":
      pageElement = document.getElementById("expenseReportPage");
      break;
    case "add-expense":
      pageElement = document.getElementById("addExpensePage");
      break;
    case "profile":
      pageElement = document.getElementById("profilePage");
      break;
    case "contact":
      pageElement = document.getElementById("contactPage");
      loadContactForm();
      break;
    default:
      pageElement = document.getElementById(`${page.replace("-", "")}Page`);
  }

  if (pageElement) {
    pageElement.classList.add("active");
  }

  currentPage = page;

  // Load page-specific content
  switch (page) {
    case "home":
      updateDashboard();
      // Show currency icon on home page
      const currencyIcon = document.querySelector(".currency-icon-container");
      if (currencyIcon) {
        currencyIcon.style.display = "block";
      }
      break;
    case "manage-expenses":
      renderExpensesList();
      // Hide currency icon on other pages but update currency display
      const currencyIconManage = document.querySelector(
        ".currency-icon-container"
      );
      if (currencyIconManage) {
        currencyIconManage.style.display = "none";
      }
      // Update currency display for this page
      updateCurrencyDisplay();
      break;
    case "expense-report":
      renderCharts();
      // Hide currency icon on other pages but update currency display
      const currencyIconReport = document.querySelector(
        ".currency-icon-container"
      );
      if (currencyIconReport) {
        currencyIconReport.style.display = "none";
      }
      // Update currency display for this page
      updateCurrencyDisplay();
      break;
    case "add-expense":
    case "addexpense":
      setCurrentDate();
      // Hide currency icon on other pages but update currency display
      const currencyIconAdd = document.querySelector(
        ".currency-icon-container"
      );
      if (currencyIconAdd) {
        currencyIconAdd.style.display = "none";
      }
      // Update currency display for this page
      updateCurrencyDisplay();
      break;
    case "profile":
      // Hide currency icon on other pages but update currency display
      const currencyIconProfile = document.querySelector(
        ".currency-icon-container"
      );
      if (currencyIconProfile) {
        currencyIconProfile.style.display = "none";
      }
      // Update currency display for this page
      updateCurrencyDisplay();
      break;
    case "contact":
      // Hide currency icon on other pages but update currency display
      const currencyIconContact = document.querySelector(
        ".currency-icon-container"
      );
      if (currencyIconContact) {
        currencyIconContact.style.display = "none";
      }
      // Update currency display for this page
      updateCurrencyDisplay();
      break;
  }
}

// Sidebar Functions
function toggleSidebar() {
  elements.sidebar.classList.toggle("active");
  elements.overlay.classList.toggle("active");
}

function closeSidebar() {
  elements.sidebar.classList.remove("active");
  elements.overlay.classList.remove("active");
}

// Expense Functions
function handleAddExpense(e) {
  e.preventDefault();

  const form = e.target;
  const action = (form.getAttribute("action") || "").toLowerCase();

  if (action.includes("add_expense.php")) {
    const formData = new FormData(form);
    fetch(action, { method: "POST", body: formData })
      .then((r) => r.json().catch(() => ({})))
      .then(() => {
        showNotification("Expense added successfully!", "success");
        window.location.reload();
      })
      .catch(() => showNotification("Failed to add expense", "error"));
    return;
  }

  // Fallback to legacy local handling
  const fileInput = form.querySelector('input[type="file"]');
  let fileData = null;
  
  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    };
  }
  
  const expense = {
    id: Date.now(),
    date: form.querySelector('[id*="Date"]').value,
    category: form.querySelector('[id*="Category"]').value,
    item: form.querySelector('[id*="Item"]').value,
    amount: parseFloat(form.querySelector('[id*="Amount"]').value),
    userId: currentUser ? currentUser.email : "",
    file: fileData
  };

  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  form.reset();
  setCurrentDate();
  updateDashboard();
  if (currentPage === "manage-expenses") renderExpensesList();
  if (currentPage === "expense-report") renderCharts();
  showNotification("Expense added successfully!", "success");
}

function handleEditExpense(e) {
  e.preventDefault();

  const form = e.target;
  const action = (form.getAttribute("action") || "edit_expense.php").toLowerCase();
  
  if (action.includes("edit_expense.php")) {
    const formData = new FormData(form);
    fetch(action, { method: "POST", body: formData })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          showNotification("Expense updated successfully!", "success");
          window.location.reload();
        } else {
          showNotification("Failed to update expense", "error");
        }
      })
      .catch(() => showNotification("Failed to update expense", "error"));
    return;
  }

  // Fallback to local handling
  const expenseId = currentEditingExpenseId;
  const expenseIndex = expenses.findIndex((e) => e.id === expenseId);
  
  if (expenseIndex === -1) {
    showNotification("Expense not found", "error");
    return;
  }

  // Get file data
  const fileInput = form.querySelector('input[type="file"]');
  let fileData = null;
  
  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    };
  } else {
    // Check if there was an existing file
    const existingFileData = form.getAttribute("data-existing-file");
    if (existingFileData) {
      fileData = JSON.parse(existingFileData);
    }
  }

  // Update the expense
  expenses[expenseIndex] = {
    ...expenses[expenseIndex],
    date: form.querySelector('[id*="Date"]').value,
    category: form.querySelector('[id*="Category"]').value,
    item: form.querySelector('[id*="Item"]').value,
    amount: parseFloat(form.querySelector('[id*="Amount"]').value),
    file: fileData
  };

  localStorage.setItem("expenses", JSON.stringify(expenses));
  hideEditExpenseModal();
  updateDashboard();
  if (currentPage === "manage-expenses") renderExpensesList();
  if (currentPage === "expense-report") renderCharts();
  showNotification("Expense updated successfully!", "success");
}

function editExpense(id) {
  const expense = expenses.find((e) => e.id === id);
  if (!expense) return;

  // Store the expense ID being edited
  currentEditingExpenseId = id;

  // Populate edit form with expense data
  document.getElementById("editExpenseDate").value = expense.date;
  document.getElementById("editExpenseCategory").value = expense.category;
  document.getElementById("editExpenseItem").value = expense.item;
  document.getElementById("editExpenseAmount").value = expense.amount;

  // Handle file data if exists
  if (expense.file) {
    // Store the existing file data for the edit form
    document.getElementById("editExpenseForm").setAttribute("data-existing-file", JSON.stringify(expense.file));
    
    // Show existing file status
    const statusDiv = document.getElementById("editExpenseFileStatus");
    if (statusDiv) {
      statusDiv.innerHTML = `
        <div class="file-upload-status has-file">
          <span class="file-name">${expense.file.name}</span>
          <span>(Existing file)</span>
          <button class="remove-file" onclick="removeFile('editExpenseFile', 'editExpenseFileStatus')" title="Remove file">×</button>
        </div>
      `;
    }
  } else {
    // Clear file status if no file
    const statusDiv = document.getElementById("editExpenseFileStatus");
    if (statusDiv) {
      statusDiv.innerHTML = '';
    }
  }

  // Show edit modal
  document.getElementById("editExpenseModal").classList.add("active");
  document.getElementById("overlay").classList.add("active");
}

function deleteExpense(id) {
  currentDeletingExpenseId = id;
  const hidden = document.getElementById("deleteExpenseId");
  if (hidden) hidden.value = id;
  document.getElementById("deleteExpenseModal").classList.add("active");
  document.getElementById("overlay").classList.add("active");
}

function confirmDeleteExpense(e) {
  if (e) e.preventDefault();
  const form = document.querySelector("#deleteExpenseModal form");
  if (!form) return;
  const formData = new FormData(form);
  fetch(form.getAttribute("action") || "delete_expense.php", { method: "POST", body: formData })
    .then((r) => r.json())
    .then((data) => {
      if (data && data.success) {
        showNotification("Expense deleted successfully!", "success");
        window.location.reload();
      } else {
        showNotification("Failed to delete expense", "error");
      }
    })
    .catch(() => showNotification("Failed to delete expense", "error"))
    .finally(() => hideDeleteExpenseModal());
}

function hideDeleteExpenseModal() {
  document.getElementById("deleteExpenseModal").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
  currentDeletingExpenseId = null;
}

function hideEditExpenseModal() {
  document.getElementById("editExpenseModal").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
  currentEditingExpenseId = null;
  
  // Clear file status
  const statusDiv = document.getElementById("editExpenseFileStatus");
  if (statusDiv) {
    statusDiv.innerHTML = '';
  }
  
  // Clear existing file data
  const editForm = document.getElementById("editExpenseForm");
  if (editForm) {
    editForm.removeAttribute("data-existing-file");
  }
}

function showBudgetForm() {
  const budgetDisplay = document.getElementById("budgetDisplay");
  const budgetForm = document.getElementById("budgetForm");
  const budgetInput = document.getElementById("budgetInput");

  if (budgetDisplay && budgetForm && budgetInput) {
    budgetDisplay.style.display = "none";
    budgetForm.style.display = "block";
    budgetInput.value = monthlyBudget || "";
    budgetInput.focus();
  }
}

function hideBudgetForm() {
  const budgetDisplay = document.getElementById("budgetDisplay");
  const budgetForm = document.getElementById("budgetForm");

  if (budgetDisplay && budgetForm) {
    budgetDisplay.style.display = "block";
    budgetForm.style.display = "none";
  }
}

function saveBudget(e) {
  if (e) e.preventDefault();
  const budgetInput = document.getElementById("budgetInput");
  const newBudget = parseFloat(budgetInput.value);
  if (!(newBudget >= 0)) {
    showNotification("Budget amount must be positive!", "error");
    return;
  }
  const formData = new FormData();
  formData.append("budgetAmount", String(newBudget));
  fetch("set_budget.php", { method: "POST", body: formData })
    .then((r) => r.json())
    .then((data) => {
      if (data && data.success) {
        showNotification("Monthly budget updated successfully!", "success");
        window.location.reload();
      } else {
        showNotification("Failed to update budget", "error");
      }
    })
    .catch(() => showNotification("Failed to update budget", "error"));
}

// Dashboard Functions
function updateDashboard() {
  const userExpenses = expenses.filter((e) => e.userId === currentUser.email);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonth = userExpenses.filter((e) => {
    const expenseDate = new Date(e.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const lastMonth = userExpenses.filter((e) => {
    const expenseDate = new Date(e.date);
    const lastMonthDate = new Date(currentYear, currentMonth - 1);
    return (
      expenseDate.getMonth() === lastMonthDate.getMonth() &&
      expenseDate.getFullYear() === lastMonthDate.getFullYear()
    );
  });

  const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const lastMonthTotal = lastMonth.reduce((sum, e) => sum + e.amount, 0);

  elements.thisMonthTotal.textContent = `${currentCurrencySymbol}${thisMonthTotal.toFixed(
    2
  )}`;
  elements.lastMonthTotal.textContent = `${currentCurrencySymbol}${lastMonthTotal.toFixed(
    2
  )}`;
  elements.monthlyBudget.textContent = `${currentCurrencySymbol}${monthlyBudget.toFixed(
    2
  )}`;

  // Update budget progress
  updateBudgetProgress(thisMonthTotal);
}

function updateBudgetProgress(thisMonthTotal) {
  const progressBar = document.getElementById("budgetProgress");
  const budgetStatus = document.getElementById("budgetStatus");

  if (!progressBar || !budgetStatus || monthlyBudget === 0) {
    if (budgetStatus) {
      budgetStatus.textContent = "Set your budget";
    }
    if (progressBar) {
      progressBar.style.width = "0%";
      progressBar.className = "progress-fill";
    }
    return;
  }

  const percentage = (thisMonthTotal / monthlyBudget) * 100;
  const clampedPercentage = Math.min(percentage, 100);

  progressBar.style.width = `${clampedPercentage}%`;

  // Update progress bar color and status based on spending
  if (percentage >= 100) {
    progressBar.className = "progress-fill danger";
    budgetStatus.textContent = "Budget exceeded!";
  } else if (percentage >= 80) {
    progressBar.className = "progress-fill warning";
    budgetStatus.textContent = "Budget warning";
  } else {
    progressBar.className = "progress-fill";
    budgetStatus.textContent = `${percentage.toFixed(1)}% used`;
  }
}

// Expenses List Functions
function renderExpensesList() {
  // Check if we're on the manage expenses page
  if (!elements.expensesList) {
    console.log(
      "Expenses list element not found - not on manage expenses page"
    );
    return;
  }

  console.log("Rendering expenses list..."); // Debug log

  const userExpenses = expenses.filter((e) => e.userId === currentUser.email);
  const filterCategory = elements.filterCategory
    ? elements.filterCategory.value
    : "";
  const filterMonth = document.getElementById("filterMonth")
    ? document.getElementById("filterMonth").value
    : "";

  console.log("Total expenses found:", userExpenses.length); // Debug log

  let filteredExpenses = userExpenses;

  // Apply category filter
  if (filterCategory) {
    filteredExpenses = filteredExpenses.filter(
      (e) => e.category === filterCategory
    );
    console.log("After category filter:", filteredExpenses.length); // Debug log
  }

  // Apply month filter
  if (filterMonth) {
    filteredExpenses = filteredExpenses.filter((e) => {
      const expenseDate = new Date(e.date);
      const filterDate = new Date(filterMonth + "-01"); // Convert YYYY-MM to YYYY-MM-01
      return (
        expenseDate.getMonth() === filterDate.getMonth() &&
        expenseDate.getFullYear() === filterDate.getFullYear()
      );
    });
    console.log("After month filter:", filteredExpenses.length); // Debug log
  }

  if (filteredExpenses.length === 0) {
    elements.expensesList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                No expenses found
            </div>
        `;
    console.log("No expenses to display"); // Debug log
    return;
  }

  elements.expensesList.innerHTML = filteredExpenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (expense) => `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-title">${expense.item}</div>
                    <div class="expense-meta">
                        <span class="category-${
                          expense.category
                        }">${getCategoryName(expense.category)}</span>
                        <span>${formatDate(expense.date)}</span>
                        ${expense.file ? `
                        <div class="expense-file">
                            <span class="file-icon">📎</span>
                            <span class="file-name">${expense.file.name}</span>
                            <button class="btn btn-sm btn-link" onclick="previewFile('${expense.file.name}', '${expense.file.type}')" title="Preview File">👁️</button>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="expense-amount">${currentCurrencySymbol}${expense.amount.toFixed(
        2
      )}</div>
                <div class="expense-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editExpense(${
                      expense.id
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteExpense(${
                      expense.id
                    })">Delete</button>
                </div>
            </div>
        `
    )
    .join("");

  console.log("Expenses list rendered successfully"); // Debug log
}

function filterExpenses() {
  renderExpensesList();
}

function clearFilters() {
  if (elements.filterCategory) {
    elements.filterCategory.value = "";
  }
  const filterMonth = document.getElementById("filterMonth");
  if (filterMonth) {
    filterMonth.value = "";
  }
  renderExpensesList();
}

// Chart Functions
function renderCharts() {
  const userExpenses = expenses.filter((e) => e.userId === currentUser.email);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = userExpenses.filter((e) => {
    const expenseDate = new Date(e.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const previousMonthExpenses = userExpenses.filter((e) => {
    const expenseDate = new Date(e.date);
    const lastMonthDate = new Date(currentYear, currentMonth - 1);
    return (
      expenseDate.getMonth() === lastMonthDate.getMonth() &&
      expenseDate.getFullYear() === lastMonthDate.getFullYear()
    );
  });

  renderPieChart(
    elements.currentMonthChart,
    currentMonthExpenses,
    "Current Month"
  );
  renderPieChart(
    elements.previousMonthChart,
    previousMonthExpenses,
    "Previous Month"
  );

  updateComparisonStats(currentMonthExpenses, previousMonthExpenses);
}

function renderPieChart(canvas, expenses, title) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Destroy existing chart
  if (canvas.chart) {
    canvas.chart.destroy();
  }

  const categoryTotals = {};
  expenses.forEach((expense) => {
    categoryTotals[expense.category] =
      (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const labels = Object.keys(categoryTotals).map((key) => getCategoryName(key));
  const data = Object.values(categoryTotals);
  const colors = Object.keys(categoryTotals).map((key) => categoryColors[key]);

  if (data.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#6B7280";
    ctx.font = "16px Inter";
    ctx.textAlign = "center";
    ctx.fillText("No data available", canvas.width / 2, canvas.height / 2);
    return;
  }

  canvas.chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#1E1E2E",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#B4B4B8",
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
      },
    },
  });
}

function updateComparisonStats(currentExpenses, previousExpenses) {
  const currentTotal = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const previousTotal = previousExpenses.reduce((sum, e) => sum + e.amount, 0);
  const difference = currentTotal - previousTotal;

  elements.currentMonthStat.textContent = `${currentCurrencySymbol}${currentTotal.toFixed(
    2
  )}`;
  elements.previousMonthStat.textContent = `${currentCurrencySymbol}${previousTotal.toFixed(
    2
  )}`;
  elements.differenceStat.textContent = `${
    difference >= 0 ? "+" : ""
  }${currentCurrencySymbol}${difference.toFixed(2)}`;
  elements.differenceStat.style.color = difference >= 0 ? "#EF4444" : "#10B981";
}

// Profile Functions
function loadProfile() {
  if (!currentUser) return;

  document.getElementById("profileName").value = currentUser.name || "";
  document.getElementById("profileEmail").value = currentUser.email || "";
  document.getElementById("profilePhone").value = currentUser.phone || "";
}

function handleUpdateProfile(e) {
  e.preventDefault();

  const name = document.getElementById("profileName").value;
  const email = document.getElementById("profileEmail").value;
  const phone = document.getElementById("profilePhone").value;
  const password = document.getElementById("profilePassword").value;

  // Update current user
  currentUser.name = name;
  currentUser.email = email;
  currentUser.phone = phone;

  if (password) {
    currentUser.password = password;
  }

  // Update in localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Update users array
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Update welcome message
  elements.welcomeUser.textContent = `Welcome, ${currentUser.name}!`;

  // Clear password field
  document.getElementById("profilePassword").value = "";

  showNotification("Profile updated successfully!", "success");
}

// Contact Functions
function loadContactForm() {
  if (currentUser) {
    // Pre-fill with user's information if available
    const nameField = document.getElementById("contactName");
    const emailField = document.getElementById("contactEmail");
    
    if (nameField && currentUser.name) {
      nameField.value = currentUser.name;
    }
    if (emailField && currentUser.email) {
      emailField.value = currentUser.email;
    }
  }
}

function handleContactSubmit(e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  // Show loading state
  submitBtn.innerHTML = '<span>⏳</span> Sending...';
  submitBtn.disabled = true;

  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const subject = document.getElementById("contactSubject").value;
  const message = document.getElementById("contactMessage").value;
  const priority = document.getElementById("contactPriority").value;

  // Create contact message object
  const contactMessage = {
    id: Date.now(),
    name,
    email,
    subject,
    message,
    priority,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  // Store in localStorage (in a real app, this would be sent to a server)
  const contactMessages = JSON.parse(localStorage.getItem("contactMessages")) || [];
  contactMessages.push(contactMessage);
  localStorage.setItem("contactMessages", JSON.stringify(contactMessages));

  // Clear form
  document.getElementById("contactForm").reset();

  // Show success message
  showNotification("Message sent successfully! We'll get back to you soon.", "success");
  
  // Reset button state
  submitBtn.innerHTML = originalText;
  submitBtn.disabled = false;
  
  // Re-load contact form to pre-fill user info again
  loadContactForm();
}

// Modal Functions
function showLogoutModal() {
  elements.logoutModal.classList.add("active");
  elements.overlay.classList.add("active");
}

function hideLogoutModal() {
  elements.logoutModal.classList.remove("active");
  elements.overlay.classList.remove("active");
}

function updateCurrencyDisplay() {
  const currencyIcon = document.getElementById("currentCurrencyIcon");
  if (currencyIcon) {
    currencyIcon.textContent = currentCurrencySymbol;
  }

  // Update selected state in dialog
  const currencyOptions = document.querySelectorAll(".currency-option");
  currencyOptions.forEach((option) => {
    option.classList.remove("selected");
    if (option.getAttribute("data-currency") === currentCurrency) {
      option.classList.add("selected");
    }
  });

  // Update currency display on all pages
  updateDashboard();

  // Update expenses list if on manage expenses page
  if (currentPage === "manage-expenses") {
    renderExpensesList();
  }

  // Update charts if on expense report page
  if (currentPage === "expense-report") {
    renderCharts();
    // Also update comparison stats to refresh currency symbols
    const userExpenses = expenses.filter((e) => e.userId === currentUser.email);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = userExpenses.filter((e) => {
      const expenseDate = new Date(e.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    const previousMonthExpenses = userExpenses.filter((e) => {
      const expenseDate = new Date(e.date);
      const lastMonthDate = new Date(currentYear, currentMonth - 1);
      return (
        expenseDate.getMonth() === lastMonthDate.getMonth() &&
        expenseDate.getFullYear() === lastMonthDate.getFullYear()
      );
    });

    updateComparisonStats(currentMonthExpenses, previousMonthExpenses);
  }
}

// Utility Functions
function setCurrentDate() {
  const today = new Date().toISOString().split("T")[0];
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach((input) => {
    if (!input.value) {
      input.value = today;
    }
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getCategoryName(category) {
  const categoryNames = {
    food: "Food & Dining",
    transport: "Transportation",
    shopping: "Shopping",
    entertainment: "Entertainment",
    bills: "Bills & Utilities",
    health: "Health & Medical",
    other: "Other",
  };
  return categoryNames[category] || category;
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${
              type === "success" ? "✓" : type === "error" ? "✕" : "ⓘ"
            }</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

  // Add notification styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        padding: 1rem 1.5rem;
        color: var(--text-primary);
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        min-width: 300px;
    `;

  const content = notification.querySelector(".notification-content");
  content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;

  const icon = notification.querySelector(".notification-icon");
  icon.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-weight: bold;
        font-size: 12px;
        color: white;
        background: ${
          type === "success"
            ? "#10B981"
            : type === "error"
            ? "#EF4444"
            : "#3B82F6"
        };
    `;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// File Upload Status Functions
function setupFileUploadStatus() {
  const fileInputs = [
    { input: 'expenseFile', status: 'expenseFileStatus' },
    { input: 'addExpenseFile', status: 'addExpenseFileStatus' },
    { input: 'editExpenseFile', status: 'editExpenseFileStatus' }
  ];

  fileInputs.forEach(({ input, status }) => {
    const fileInput = document.getElementById(input);
    const statusDiv = document.getElementById(status);
    
    if (fileInput && statusDiv) {
      fileInput.addEventListener('change', (e) => {
        updateFileUploadStatus(e.target, statusDiv);
      });
    }
  });
}

function updateFileUploadStatus(fileInput, statusDiv) {
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileSize = (file.size / 1024).toFixed(1); // Convert to KB
    
    statusDiv.innerHTML = `
      <div class="file-upload-status has-file">
        <span class="file-name">${file.name}</span>
        <span>(${fileSize} KB)</span>
        <button class="remove-file" onclick="removeFile('${fileInput.id}', '${statusDiv.id}')" title="Remove file">×</button>
      </div>
    `;
  } else {
    statusDiv.innerHTML = '';
  }
}

function removeFile(inputId, statusId) {
  const fileInput = document.getElementById(inputId);
  const statusDiv = document.getElementById(statusId);
  
  if (fileInput) {
    fileInput.value = '';
  }
  if (statusDiv) {
    statusDiv.innerHTML = '';
  }
}

// File Preview Functions
function previewFile(fileName, fileType) {
  const modal = document.getElementById("filePreviewModal");
  const modalTitle = document.getElementById("filePreviewTitle");
  const modalBody = document.getElementById("filePreviewBody");
  
  modalTitle.textContent = `File Preview: ${fileName}`;
  
  // Show file type information since we can't actually preview the file content
  // In a real application, you would need to store the actual file data or use a backend
  modalBody.innerHTML = `
    <div class="file-preview-info">
      <div class="file-info-item">
        <strong>File Name:</strong> ${fileName}
      </div>
      <div class="file-info-item">
        <strong>File Type:</strong> ${fileType}
      </div>
      <div class="file-info-item">
        <strong>Note:</strong> This is a receipt/file attachment for the expense. 
        In a production environment, you would be able to view the actual file content.
      </div>
    </div>
  `;
  
  modal.classList.add("active");
  document.getElementById("overlay").classList.add("active");
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
