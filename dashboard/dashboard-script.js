// Global State Variables
let currentUser = null;
let expenses = [];
let currentPage = "home";
let currentCurrency = localStorage.getItem("currentCurrency") || "USD";
let currentCurrencySymbol =
  localStorage.getItem("currentCurrencySymbol") || "$";
let currentEditingExpenseId = null;
let currentDeletingExpenseId = null;
let monthlyBudget = 0;

const categoryColors = {
  food: "#F59E0B",
  transport: "#3B82F6",
  shopping: "#8B5CF6",
  entertainment: "#EF4444",
  bills: "#10B981",
  health: "#EC4899",
  other: "#6B7280",
};

// Initialize Application
function init() {
  console.log("Initializing dashboard...");

  // Get user from PHP session (set in the HTML)
  currentUser = {
    id: "<?php echo $_SESSION['user_id']; ?>",
    name: "<?php echo $_SESSION['user_name']; ?>",
    email: "<?php echo $_SESSION['user_email']; ?>",
  };

  console.log("Current user:", currentUser);

  // If no user, redirect to login
  if (!currentUser.id || currentUser.id === "") {
    console.log("No user found, redirecting to login...");
    window.location.href = "../auth/login.php";
    return;
  }

  // Load user data
  loadUserData();
  loadUserCount();


  // Setup everything
  setupEventListeners();
  setCurrentDate();
  updateCurrencyDisplay();

  // Load initial page content
  loadPageContent(currentPage);

  console.log("Dashboard initialized successfully!");
}

function loadUserData() {
  if (currentUser && currentUser.id) {
    const expensesKey = `expenses_${currentUser.id}`;
    const budgetKey = `monthlyBudget_${currentUser.id}`;

    fetch("get_expenses.php", {
      method: "GET",
      credentials: "include", // 🔑 keeps PHP session
    })
      .then((response) => response.json())
      .then((data) => {
        expenses = data || [];
        console.log(
          `Loaded ${expenses.length} expenses from DB for user ${currentUser.id}`
        );
        updateDashboard();
        if (currentPage === "manage-expenses") renderExpensesList();
      })
      .catch((err) => {
        expenses = [];
        console.error("Failed to load expenses:", err);
      });

    // TODO: Load monthlyBudget from DB if you move it there
  }
}

function saveUserData() {
  // This function is no longer needed since we're using the database
  // Remove any calls to this function from your code
  console.log("Data is now saved directly to database");
}

// Event Listeners Setup
function setupEventListeners() {
  console.log("Setting up event listeners...");

  // Navigation - FIX FOR HAMBURGER MENU
  const burgerMenu = document.getElementById("burgerMenu");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.getElementById("closeSidebar");
  const overlay = document.getElementById("overlay");

  if (burgerMenu && sidebar) {
    burgerMenu.addEventListener("click", function () {
      console.log("Hamburger menu clicked!");
      sidebar.classList.toggle("active");
      if (overlay) overlay.classList.toggle("active");
    });
  }

  if (closeSidebar && overlay) {
    closeSidebar.addEventListener("click", function () {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });

    overlay.addEventListener("click", function () {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  }

  // Navigation items
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    if (item.id !== "logoutBtn") {
      item.addEventListener("click", handleNavigation);
    }
  });

  // Currency
  const currencyIconBtn = document.getElementById("currencyIconBtn");
  const currencyDialog = document.getElementById("currencyDialog");
  const closeCurrencyDialog = document.getElementById("closeCurrencyDialog");

  if (currencyIconBtn && currencyDialog) {
    currencyIconBtn.addEventListener("click", function () {
      currencyDialog.classList.add("active");
      if (overlay) overlay.classList.add("active");
    });
  }

  if (closeCurrencyDialog && currencyDialog && overlay) {
    closeCurrencyDialog.addEventListener("click", function () {
      currencyDialog.classList.remove("active");
      overlay.classList.remove("active");
    });

    currencyDialog.addEventListener("click", function (e) {
      if (e.target === currencyDialog) {
        currencyDialog.classList.remove("active");
        overlay.classList.remove("active");
      }
    });
  }

  // Currency options
  const currencyOptions = document.querySelectorAll(".currency-option");
  currencyOptions.forEach((option) => {
    option.addEventListener("click", handleCurrencyChange);
  });

  // Forms
  const expenseForm = document.getElementById("expenseForm");
  const profileForm = document.getElementById("profileForm");
  const contactForm = document.getElementById("contactForm");

  if (expenseForm) expenseForm.addEventListener("submit", handleAddExpense);
  if (profileForm) profileForm.addEventListener("submit", handleUpdateProfile);
  if (contactForm) contactForm.addEventListener("submit", handleContactSubmit);

  // Budget
  const editBudgetBtn = document.getElementById("editBudgetBtn");
  const saveBudgetBtn = document.getElementById("saveBudgetBtn");
  const cancelBudgetBtn = document.getElementById("cancelBudgetBtn");

  if (editBudgetBtn) editBudgetBtn.addEventListener("click", showBudgetForm);
  if (saveBudgetBtn) saveBudgetBtn.addEventListener("click", saveBudget);
  if (cancelBudgetBtn)
    cancelBudgetBtn.addEventListener("click", hideBudgetForm);

  // Filters
  const filterCategory = document.getElementById("filterCategory");
  const filterMonth = document.getElementById("filterMonth");
  const clearFilters = document.getElementById("clearFilters");

  if (filterCategory) filterCategory.addEventListener("change", filterExpenses);
  if (filterMonth) filterMonth.addEventListener("change", filterExpenses);
  if (clearFilters) clearFilters.addEventListener("click", clearFilters);

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  const confirmLogout = document.getElementById("confirmLogout");
  const cancelLogout = document.getElementById("cancelLogout");

  if (logoutBtn) logoutBtn.addEventListener("click", showLogoutModal);
  if (confirmLogout) confirmLogout.addEventListener("click", handleLogout);
  if (cancelLogout) cancelLogout.addEventListener("click", hideLogoutModal);

  // Edit/Delete modals
  const cancelEdit = document.getElementById("cancelEdit");
  const confirmDelete = document.getElementById("confirmDelete");
  const cancelDelete = document.getElementById("cancelDelete");

  if (cancelEdit) cancelEdit.addEventListener("click", hideEditExpenseModal);
  if (confirmDelete)
    confirmDelete.addEventListener("click", confirmDeleteExpense);
  if (cancelDelete)
    cancelDelete.addEventListener("click", hideDeleteExpenseModal);

  // Edit expense form
  const editExpenseForm = document.getElementById("editExpenseForm");
  if (editExpenseForm) {
    editExpenseForm.addEventListener("submit", handleEditExpense);
  }

  console.log("Event listeners setup complete!");
}

// Navigation Functions
function handleNavigation(e) {
  e.preventDefault();
  const page = e.currentTarget.getAttribute("data-page");

  if (!page) return;

  console.log("Navigating to page:", page);

  // Update active nav item
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => item.classList.remove("active"));
  e.currentTarget.classList.add("active");

  // Show corresponding content page
  showContentPage(page);

  // Close sidebar on mobile
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (sidebar) sidebar.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
}

function showContentPage(page) {
  // Hide all content pages
  const contentPages = document.querySelectorAll(".content-page");
  contentPages.forEach((contentPage) => {
    contentPage.classList.remove("active");
  });

  // Show selected page
  const pageElement = document.getElementById(`${page}Page`);
  if (pageElement) {
    pageElement.classList.add("active");
    currentPage = page;

    // Load page-specific content
    loadPageContent(page);
  }
}

// NEW FUNCTION: Load specific page content
function loadPageContent(page) {
  console.log("Loading content for page:", page);

  switch (page) {
    case "home":
      updateDashboard();
      // Show currency icon
      const currencyIcon = document.querySelector(".currency-icon-container");
      if (currencyIcon) currencyIcon.style.display = "block";
      break;

    case "manage-expenses":
      setupAdvancedFilters();
      renderExpensesList();
      // Hide currency icon
      const currencyIcon2 = document.querySelector(".currency-icon-container");
      if (currencyIcon2) currencyIcon2.style.display = "none";
      break;

    case "expense-report":
      renderCharts();
      // Hide currency icon
      const currencyIcon3 = document.querySelector(".currency-icon-container");
      if (currencyIcon3) currencyIcon3.style.display = "none";
      break;

    case "profile":
      loadProfileData();
      // Hide currency icon
      const currencyIcon4 = document.querySelector(".currency-icon-container");
      if (currencyIcon4) currencyIcon4.style.display = "none";
      break;

    case "contact":
      // Hide currency icon
      const currencyIcon5 = document.querySelector(".currency-icon-container");
      if (currencyIcon5) currencyIcon5.style.display = "none";
      break;
  }
}

// Enhanced Expenses List Functions
function renderExpensesList() {
  const expensesList = document.getElementById("expensesList");
  if (!expensesList) {
    console.log("Expenses list container not found!");
    return;
  }

  expensesList.innerHTML = ""; // Clear previous list

  if (!expenses || expenses.length === 0) {
    expensesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💰</div>
        <h3>No Expenses Found</h3>
        <p>No expenses have been added yet. Start by adding your first expense!</p>
        <button class="btn btn-primary" onclick="showContentPage('home')">
          Add Your First Expense
        </button>
      </div>
    `;
    return;
  }

  console.log("Rendering expenses list...");

  // Remove the user filter since expenses already come filtered from backend
  const filterCategory = document.getElementById("filterCategory");
  const filterMonth = document.getElementById("filterMonth");

  let filteredExpenses = expenses; // Use all expenses (already filtered by user in backend)

  // Apply category filter
  if (filterCategory && filterCategory.value) {
    filteredExpenses = filteredExpenses.filter(
      (e) => e.category === filterCategory.value
    );
  }

  // Apply month filter
  if (filterMonth && filterMonth.value) {
    filteredExpenses = filteredExpenses.filter((e) => {
      const expenseDate = new Date(e.date);
      const filterDate = new Date(filterMonth.value + "-01");
      return (
        expenseDate.getMonth() === filterDate.getMonth() &&
        expenseDate.getFullYear() === filterDate.getFullYear()
      );
    });
  }

  if (filteredExpenses.length === 0) {
    expensesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No Expenses Found</h3>
        <p>No expenses match your current filters. Try adjusting your search criteria or add new expenses.</p>
        <button class="btn btn-secondary" onclick="clearFilters()">
          Clear Filters
        </button>
      </div>
    `;
    return;
  }

  // Calculate total for the filtered expenses
  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  expensesList.innerHTML = `
    <div class="expenses-summary" style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: var(--text-secondary);">Total: ${
          filteredExpenses.length
        } expenses</span>
        <span style="font-weight: 600; color: var(--primary-color);">
          ${currentCurrencySymbol}${totalAmount.toFixed(2)}
        </span>
      </div>
    </div>
    ${filteredExpenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(
        (expense) => `
        <div class="expense-item">
          <div class="expense-info">
            <div class="expense-title">${expense.item}</div>
            <div class="expense-meta">
              <span class="category-${expense.category}">
                ${getCategoryName(expense.category)}
              </span>
              <span>${formatDate(expense.date)}</span>
              ${
                expense.file_path
                  ? `
              <div class="expense-file">
                <span class="file-icon">📎</span>
                <span class="file-name">${expense.file_path}</span>
              </div>
              `
                  : ""
              }
            </div>
          </div>
          <div class="expense-amount">${currentCurrencySymbol}${parseFloat(
          expense.amount
        ).toFixed(2)}</div>
          <div class="expense-actions">
            <button class="btn btn-sm btn-secondary" onclick="editExpense(${
              expense.id
            })" title="Edit Expense">
              ✏️ Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteExpense(${
              expense.id
            })" title="Delete Expense">
              🗑️ Delete
            </button>
          </div>
        </div>
      `
      )
      .join("")}
  `;

  console.log(`Rendered ${filteredExpenses.length} expenses`);
}
// Enhanced Chart Functions
function renderCharts() {
  const currentMonthChart = document.getElementById("currentMonthChart");
  const previousMonthChart = document.getElementById("previousMonthChart");

  if (!currentMonthChart || !previousMonthChart) {
    console.log("Charts not found, skipping render...");
    return;
  }

  console.log("Rendering charts...");

  // Remove user filter since expenses are already user-specific from backend
  const userExpenses = expenses; // Changed this line

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

  // Render charts
  renderPieChart(currentMonthChart, currentMonthExpenses, "Current Month");
  renderPieChart(previousMonthChart, previousMonthExpenses, "Previous Month");

  // Update comparison stats
  updateComparisonStats(currentMonthExpenses, previousMonthExpenses);

  console.log("Charts rendered successfully");
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
    // Show empty state
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#6B7280";
    ctx.font = "14px Inter";
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
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${currentCurrencySymbol}${value.toFixed(
                2
              )} (${percentage}%)`;
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

  const currentMonthStat = document.getElementById("currentMonthStat");
  const previousMonthStat = document.getElementById("previousMonthStat");
  const differenceStat = document.getElementById("differenceStat");

  if (currentMonthStat) {
    currentMonthStat.textContent = `${currentCurrencySymbol}${currentTotal.toFixed(
      2
    )}`;
  }

  if (previousMonthStat) {
    previousMonthStat.textContent = `${currentCurrencySymbol}${previousTotal.toFixed(
      2
    )}`;
  }

  if (differenceStat) {
    const isPositive = difference >= 0;
    differenceStat.textContent = `${
      isPositive ? "+" : ""
    }${currentCurrencySymbol}${Math.abs(difference).toFixed(2)}`;
    differenceStat.style.color = isPositive ? "#EF4444" : "#10B981";
  }
}

// Enhanced Filter Functions
function setupAdvancedFilters() {
  // Set default month filter to current month
  const filterMonth = document.getElementById("filterMonth");
  if (filterMonth && !filterMonth.value) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    filterMonth.value = `${year}-${month}`;
  }
}

function filterExpenses() {
  renderExpensesList();
}

function clearFilters() {
  const filterCategory = document.getElementById("filterCategory");
  const filterMonth = document.getElementById("filterMonth");

  if (filterCategory) filterCategory.value = "";
  if (filterMonth) filterMonth.value = "";
  renderExpensesList();
}

// [REST OF YOUR EXISTING FUNCTIONS REMAIN THE SAME - Expense Functions, Budget Functions, etc.]

// Expense Functions
function handleAddExpense(e) {
  e.preventDefault();

  const form = e.target;
  const dateInput = document.getElementById("expenseDate");
  const categoryInput = document.getElementById("expenseCategory");
  const itemInput = document.getElementById("expenseItem");
  const amountInput = document.getElementById("expenseAmount");

  if (!dateInput || !categoryInput || !itemInput || !amountInput) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  // Create FormData for backend submission
  const formData = new FormData();
  formData.append("date", dateInput.value);
  formData.append("category", categoryInput.value);
  formData.append("item", itemInput.value);
  formData.append("amount", amountInput.value);
  // If you have file uploads, add: formData.append("file", fileInput.files[0]);

  // Send to backend
  fetch("add_expense.php", {
    method: "POST",
    body: formData,
    credentials: "include", // Important for session
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((result) => {
      console.log("Add expense result:", result);
      showNotification("Expense added successfully!", "success");
      form.reset();
      setCurrentDate();

      // Reload expenses from database
      loadUserData();
    })
    .catch((err) => {
      console.error("Add expense error:", err);
      showNotification("Failed to add expense: " + err.message, "error");
    });
}

function editExpense(id) {
  const expense = expenses.find((e) => e.id === id);
  if (!expense) return;

  currentEditingExpenseId = id;

  // Populate edit form
  const editDate = document.getElementById("editExpenseDate");
  const editCategory = document.getElementById("editExpenseCategory");
  const editItem = document.getElementById("editExpenseItem");
  const editAmount = document.getElementById("editExpenseAmount");

  if (editDate) editDate.value = expense.date;
  if (editCategory) editCategory.value = expense.category;
  if (editItem) editItem.value = expense.item;
  if (editAmount) editAmount.value = expense.amount;

  // Show edit modal
  const editModal = document.getElementById("editExpenseModal");
  const overlay = document.getElementById("overlay");
  if (editModal) editModal.classList.add("active");
  if (overlay) overlay.classList.add("active");
}

function handleEditExpense(e) {
  e.preventDefault();

  if (!currentEditingExpenseId) return;

  const expenseIndex = expenses.findIndex(
    (e) => e.id === currentEditingExpenseId
  );
  if (expenseIndex === -1) return;

  const editDate = document.getElementById("editExpenseDate");
  const editCategory = document.getElementById("editExpenseCategory");
  const editItem = document.getElementById("editExpenseItem");
  const editAmount = document.getElementById("editExpenseAmount");

  if (!editDate || !editCategory || !editItem || !editAmount) return;

  expenses[expenseIndex] = {
    ...expenses[expenseIndex],
    date: editDate.value,
    category: editCategory.value,
    item: editItem.value,
    amount: parseFloat(editAmount.value),
  };

  saveUserData();
  hideEditExpenseModal();

  updateDashboard();
  if (currentPage === "manage-expenses") renderExpensesList();
  if (currentPage === "expense-report") renderCharts();

  showNotification("Expense updated successfully!", "success");
}

function deleteExpense(expenseId) {
  if (!expenseId) return;

  if (!confirm("Are you sure you want to delete this expense?")) return;

  const formData = new FormData();
  formData.append("expense_id", expenseId);

  fetch("delete_expense.php", {
    method: "POST",
    body: formData,
    credentials: "include",
  })
    .then((response) => response.text())
    .then((message) => {
      console.log("Delete result:", message);
      showNotification("Expense deleted successfully!", "success");
      // Reload expenses from DB
      loadUserData();
    })
    .catch((err) => {
      console.error("Failed to delete expense:", err);
      showNotification("Failed to delete expense!", "error");
    });
}

function confirmDeleteExpense() {
  expenses = expenses.filter((e) => e.id !== currentDeletingExpenseId);
  saveUserData();
  hideDeleteExpenseModal();

  updateDashboard();
  if (currentPage === "manage-expenses") renderExpensesList();
  if (currentPage === "expense-report") renderCharts();

  showNotification("Expense deleted successfully!", "success");
}

function hideDeleteExpenseModal() {
  const deleteModal = document.getElementById("deleteExpenseModal");
  const overlay = document.getElementById("overlay");
  if (deleteModal) deleteModal.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  currentDeletingExpenseId = null;
}

function hideEditExpenseModal() {
  const editModal = document.getElementById("editExpenseModal");
  const overlay = document.getElementById("overlay");
  if (editModal) editModal.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  currentEditingExpenseId = null;
}

// Budget Functions
function showBudgetForm() {
  const budgetDisplay = document.getElementById("budgetDisplay");
  const budgetForm = document.getElementById("budgetForm");
  const budgetInput = document.getElementById("budgetInput");

  if (budgetDisplay) budgetDisplay.style.display = "none";
  if (budgetForm) budgetForm.style.display = "block";
  if (budgetInput) {
    budgetInput.value = monthlyBudget || "";
    budgetInput.focus();
  }
}

function hideBudgetForm() {
  const budgetDisplay = document.getElementById("budgetDisplay");
  const budgetForm = document.getElementById("budgetForm");

  if (budgetDisplay) budgetDisplay.style.display = "block";
  if (budgetForm) budgetForm.style.display = "none";
}

function saveBudget(e) {
  if (e) e.preventDefault();
  const budgetInput = document.getElementById("budgetInput");
  if (!budgetInput) return;

  const newBudget = parseFloat(budgetInput.value);

  if (!(newBudget >= 0)) {
    showNotification("Budget amount must be positive!", "error");
    return;
  }

  monthlyBudget = newBudget;
  saveUserData();

  hideBudgetForm();
  updateDashboard();
  // Add expense using backend
  const formData = new FormData();
  formData.append("date", dateInput.value);
  formData.append("category", categoryInput.value);
  formData.append("item", itemInput.value);
  formData.append("amount", amountInput.value);
  // If you want to handle file uploads, add file here

  fetch("add_expense.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((result) => {
      showNotification("Expense added successfully!", "success");
      e.target.reset();
      loadUserData(); // Refresh expenses from DB
    })
    .catch((err) => {
      showNotification("Failed to add expense!", "error");
      console.error("Add expense error:", err);
    });
}

// Dashboard Functions
function updateDashboard() {
  // Remove the user filter since expenses are already user-specific
  const userExpenses = expenses; // Already filtered by backend

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

  const thisMonthTotal = thisMonth.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );
  const lastMonthTotal = lastMonth.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );

  const thisMonthTotalEl = document.getElementById("thisMonthTotal");
  const lastMonthTotalEl = document.getElementById("lastMonthTotal");
  const monthlyBudgetEl = document.getElementById("monthlyBudget");

  if (thisMonthTotalEl)
    thisMonthTotalEl.textContent = `${currentCurrencySymbol}${thisMonthTotal.toFixed(
      2
    )}`;
  if (lastMonthTotalEl)
    lastMonthTotalEl.textContent = `${currentCurrencySymbol}${lastMonthTotal.toFixed(
      2
    )}`;
  if (monthlyBudgetEl)
    monthlyBudgetEl.textContent = `${currentCurrencySymbol}${monthlyBudget.toFixed(
      2
    )}`;

  updateBudgetProgress(thisMonthTotal);
}

function loadUserData() {
  if (currentUser && currentUser.id) {
    fetch("get_expenses.php", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        expenses = data || [];
        console.log(
          `Loaded ${expenses.length} expenses from DB for user ${currentUser.id}`
        );

        // Update dashboard with new data
        updateDashboard(); // Add this line

        if (currentPage === "manage-expenses") renderExpensesList();
        if (currentPage === "expense-report") renderCharts();
      })
      .catch((err) => {
        expenses = [];
        console.error("Failed to load expenses:", err);
      });
  }
}
function loadUserCount() {
  fetch("get_user_count.php", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.total_users !== undefined) {
        const totalUsersEl = document.getElementById("totalUsers");
        if (totalUsersEl) {
          totalUsersEl.textContent = data.total_users;
        }
      } else if (data.error) {
        console.error("Error loading user count:", data.error);
      }
    })
    .catch((err) => {
      console.error("Failed to load user count:", err);
    });
}
function updateBudgetProgress(thisMonthTotal) {
  const budgetProgress = document.getElementById("budgetProgress");
  const budgetStatus = document.getElementById("budgetStatus");

  if (!budgetProgress || !budgetStatus || monthlyBudget === 0) {
    if (budgetStatus) budgetStatus.textContent = "Set your budget";
    if (budgetProgress) {
      budgetProgress.style.width = "0%";
      budgetProgress.className = "progress-fill";
    }
    return;
  }

  const percentage = (thisMonthTotal / monthlyBudget) * 100;
  const clampedPercentage = Math.min(percentage, 100);

  budgetProgress.style.width = `${clampedPercentage}%`;

  if (percentage >= 100) {
    budgetProgress.className = "progress-fill danger";
    budgetStatus.textContent = "Budget exceeded!";
  } else if (percentage >= 80) {
    budgetProgress.className = "progress-fill warning";
    budgetStatus.textContent = "Budget warning";
  } else {
    budgetProgress.className = "progress-fill";
    budgetStatus.textContent = `${percentage.toFixed(1)}% used`;
  }
}

// Profile Functions
function handleUpdateProfile(e) {
  e.preventDefault();

  const nameInput = document.getElementById("profileName");
  const emailInput = document.getElementById("profileEmail");
  const phoneInput = document.getElementById("profilePhone");

  if (!nameInput || !emailInput) return;

  // Update current user
  currentUser.name = nameInput.value;
  currentUser.email = emailInput.value;
  currentUser.phone = phoneInput ? phoneInput.value : "";

  // Update welcome message
  const welcomeUser = document.getElementById("welcomeUser");
  if (welcomeUser) {
    welcomeUser.textContent = `Welcome, ${currentUser.name}!`;
  }

  showNotification("Profile updated successfully!", "success");
}

// function loadProfileData() {
//     const profileName = document.getElementById("profileName");
//     const profileEmail = document.getElementById("profileEmail");
//     const profilePhone = document.getElementById("profilePhone");

//     if (profileName) profileName.value = currentUser.name || "";
//     if (profileEmail) profileEmail.value = currentUser.email || "";
//     if (profilePhone) profilePhone.value = currentUser.phone || "";
// }

// Contact Functions
function handleContactSubmit(e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  // Show loading state
  submitBtn.innerHTML = "<span>⏳</span> Sending...";
  submitBtn.disabled = true;

  // Simulate sending
  setTimeout(() => {
    // Clear form
    e.target.reset();

    // Show success message
    showNotification(
      "Message sent successfully! We'll get back to you soon.",
      "success"
    );

    // Reset button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }, 2000);
}

// Logout Functions
function showLogoutModal() {
  const logoutModal = document.getElementById("logoutModal");
  const overlay = document.getElementById("overlay");
  if (logoutModal) logoutModal.classList.add("active");
  if (overlay) overlay.classList.add("active");
}

function hideLogoutModal() {
  const logoutModal = document.getElementById("logoutModal");
  const overlay = document.getElementById("overlay");
  if (logoutModal) logoutModal.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
}

function handleLogout() {
  window.location.href = "logout.php";
}

// Currency Functions
function handleCurrencyChange(e) {
  const option = e.currentTarget;
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

  // Update charts if on expense report page
  if (currentPage === "expense-report") {
    renderCharts();
  }

  // Close dialog
  const currencyDialog = document.getElementById("currencyDialog");
  const overlay = document.getElementById("overlay");
  if (currencyDialog) currencyDialog.classList.remove("active");
  if (overlay) overlay.classList.remove("active");

  showNotification(`Currency changed to ${currency}`, "success");
}

function updateCurrencyDisplay() {
  const currentCurrencyIcon = document.getElementById("currentCurrencyIcon");
  if (currentCurrencyIcon) {
    currentCurrencyIcon.textContent = currentCurrencySymbol;
  }

  // Update selected state in dialog
  const currencyOptions = document.querySelectorAll(".currency-option");
  currencyOptions.forEach((option) => {
    option.classList.remove("selected");
    if (option.getAttribute("data-currency") === currentCurrency) {
      option.classList.add("selected");
    }
  });
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
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

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

  // Add basic styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem 1.5rem;
        color: var(--text-primary);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        min-width: 300px;
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
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
