// Client-side validation and enhancements
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    
    // Real-time password confirmation validation
    const confirmPasswordInput = document.getElementById('signupConfirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }

    // Form submission enhancements
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
});

function validatePasswordMatch() {
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('signupConfirmPassword');

    if (confirmPassword && password) {
        if (confirmPassword.value && password.value !== confirmPassword.value) {
            confirmPassword.style.borderColor = 'var(--danger-color)';
        } else if (confirmPassword.value) {
            confirmPassword.style.borderColor = 'var(--success-color)';
        } else {
            confirmPassword.style.borderColor = 'var(--border-color)';
        }
    }
}

function handleSignupSubmit(e) {
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('signupConfirmPassword');
    
    // Client-side validation
    if (password.value.length < 6) {
        e.preventDefault();
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (password.value !== confirmPassword.value) {
        e.preventDefault();
        showNotification('Passwords do not match', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Creating Account...';
    submitBtn.disabled = true;

    // Re-enable after form submission
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function handleLoginSubmit(e) {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Signing In...';
    submitBtn.disabled = true;

    // Re-enable after form submission
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Notification function (for any client-side messages)
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${
                type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ'
            }</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}