// Enhanced Form Handling with Validation
(function() {
    'use strict';

    // Show loading overlay
    function showLoading() {
        let overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(overlay);
        }
        setTimeout(() => overlay.classList.add('show'), 10);
    }

    // Hide loading overlay
    function hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // Show form message
    function showMessage(form, type, message) {
        let messageEl = form.querySelector('.form-message');

        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'form-message';
            form.insertBefore(messageEl, form.firstChild);
        }

        messageEl.className = `form-message ${type} show`;
        messageEl.innerHTML = `
            <span class="form-message-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span>${message}</span>
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 5000);
    }

    // Email validation
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Handle contact form submission
    document.addEventListener('DOMContentLoaded', function() {
        const contactForm = document.getElementById('contactForm');

        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData);

                // Validate email
                if (!isValidEmail(data.email)) {
                    showMessage(contactForm, 'error', 'Please enter a valid email address.');
                    return;
                }

                showLoading();

                try {
                    // Simulate API call (replace with actual endpoint)
                    const response = await fetch('/api/submit-lead', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    hideLoading();

                    if (response.ok) {
                        showMessage(contactForm, 'success', 'Thank you! We\'ll get back to you within 24 hours.');
                        contactForm.reset();

                        // Track conversion
                        if (typeof trackEvent === 'function') {
                            trackEvent('Form', 'submit_success', 'contact');
                        }
                    } else {
                        throw new Error('Server error');
                    }
                } catch (error) {
                    hideLoading();
                    showMessage(contactForm, 'error', 'Oops! Something went wrong. Please try again or email us directly.');

                    if (typeof trackEvent === 'function') {
                        trackEvent('Form', 'submit_error', 'contact');
                    }
                }
            });
        }

        // Handle newsletter form submission
        const newsletterForm = document.getElementById('newsletterForm');

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput.value;

                if (!isValidEmail(email)) {
                    showMessage(newsletterForm, 'error', 'Please enter a valid email address.');
                    return;
                }

                showLoading();

                try {
                    // Simulate API call (replace with actual newsletter service)
                    const response = await fetch('/api/newsletter-subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email })
                    });

                    hideLoading();

                    if (response.ok) {
                        showMessage(newsletterForm, 'success', 'Success! Check your email to confirm your subscription.');
                        newsletterForm.reset();

                        if (typeof trackEvent === 'function') {
                            trackEvent('Newsletter', 'subscribe', email);
                        }
                    } else {
                        throw new Error('Server error');
                    }
                } catch (error) {
                    hideLoading();
                    showMessage(newsletterForm, 'error', 'Unable to subscribe right now. Please try again later.');

                    if (typeof trackEvent === 'function') {
                        trackEvent('Newsletter', 'subscribe_error', email);
                    }
                }
            });
        }

        // Add input validation styling
        const inputs = document.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    this.style.borderColor = '#ef4444';
                } else if (this.type === 'email' && !isValidEmail(this.value)) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '#10b981';
                }
            });

            input.addEventListener('focus', function() {
                this.style.borderColor = '#0ea5e9';
            });
        });
    });

})();
