/**
 * Main Application JavaScript
 * Handles navigation, mobile menu, and contact form
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initContactForm();
    initAffiliateTracking();
});

/**
 * Initialize navigation and mobile menu
 */
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}

/**
 * Initialize contact form handling
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate form
            if (!validateForm(contactForm)) {
                return;
            }

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                business: document.getElementById('business').value,
                message: document.getElementById('message').value,
                timestamp: new Date().toISOString(),
                source: 'homepage-contact'
            };

            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> Sending...';

            try {
                // Try to submit to serverless function
                const response = await submitLead(formData);

                if (response.success) {
                    showAlert('Thank you! We\'ll get back to you within 24 hours.', 'success', 'formAlert');
                    contactForm.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);

                // Fallback: mailto link
                const mailtoLink = `mailto:your-email@example.com?subject=Website Inquiry from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(
                    `Name: ${formData.name}\n` +
                    `Email: ${formData.email}\n` +
                    `Business: ${formData.business}\n\n` +
                    `Message:\n${formData.message}`
                )}`;

                window.location.href = mailtoLink;
                showAlert('Opening your email client...', 'info', 'formAlert');
            } finally {
                // Reset button
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });

        // Create alert container if it doesn't exist
        if (!document.getElementById('formAlert')) {
            const alertContainer = document.createElement('div');
            alertContainer.id = 'formAlert';
            contactForm.insertBefore(alertContainer, contactForm.firstChild);
        }
    }
}

/**
 * Submit lead to serverless function
 * @param {Object} formData - The form data to submit
 * @returns {Promise} - Response from server
 */
async function submitLead(formData) {
    // Try to submit to serverless function
    // If deployed on Netlify, this will be /.netlify/functions/submit-lead
    // If deployed on Vercel, this will be /api/submit-lead

    try {
        const response = await fetch('/.netlify/functions/submit-lead', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        // If Netlify function doesn't exist, try Vercel
        try {
            const response = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } catch (vercelError) {
            // Both failed, will use mailto fallback
            throw vercelError;
        }
    }
}

/**
 * Track affiliate link clicks
 */
function initAffiliateTracking() {
    const affiliateLinks = document.querySelectorAll('a[href*="bluehost.sjv.io"]');

    affiliateLinks.forEach(link => {
        link.addEventListener('click', () => {
            trackAffiliateClick('bluehost-' + link.textContent.toLowerCase().replace(/\s+/g, '-'));
        });
    });
}
