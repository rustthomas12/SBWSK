/**
 * Utility Functions
 * Shared helper functions used across the application
 */

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format domain name (remove spaces, lowercase, etc.)
function formatDomainName(domain) {
    return domain
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9-]/g, '');
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show/hide elements
function show(element) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    if (element) {
        element.classList.remove('hidden');
        element.classList.add('visible');
    }
}

function hide(element) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    if (element) {
        element.classList.add('hidden');
        element.classList.remove('visible');
    }
}

// Show alert message
function showAlert(message, type = 'info', containerId = 'alertContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    container.innerHTML = '';
    container.appendChild(alert);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.3s';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Local storage helpers
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    }
};

// Track affiliate link clicks (for analytics)
function trackAffiliateClick(linkName) {
    // This can be extended with Google Analytics or other tracking
    console.log('Affiliate click:', linkName);

    // Example: Send to analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'Affiliate',
            'event_label': linkName
        });
    }
}

// Generate a simple unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Form validation helper
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        const errorElement = input.parentElement.querySelector('.error-message');

        if (!input.value.trim()) {
            input.classList.add('form-error');
            if (!errorElement) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'This field is required';
                input.parentElement.appendChild(error);
            }
            isValid = false;
        } else {
            input.classList.remove('form-error');
            if (errorElement) {
                errorElement.remove();
            }

            // Email validation
            if (input.type === 'email' && !isValidEmail(input.value)) {
                input.classList.add('form-error');
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Please enter a valid email address';
                input.parentElement.appendChild(error);
                isValid = false;
            }
        }
    });

    return isValid;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatDomainName,
        isValidEmail,
        show,
        hide,
        showAlert,
        storage,
        trackAffiliateClick,
        generateId,
        debounce,
        scrollToElement,
        validateForm
    };
}
