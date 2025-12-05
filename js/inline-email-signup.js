/**
 * Inline Email Signup Component
 * Non-intrusive email collection for strategic placement in content
 */

(function() {
    'use strict';

    /**
     * Create inline email signup form
     * @param {Object} options - Configuration options
     * @returns {HTMLElement} - The signup element
     */
    function createInlineSignup(options = {}) {
        const {
            title = 'Want more free tools and tips?',
            subtitle = 'Join our email list to get exclusive templates, checklists, and website building guides.',
            buttonText = 'Get Free Resources',
            source = 'inline-signup',
            style = 'default' // 'default', 'compact', 'sidebar'
        } = options;

        const container = document.createElement('div');
        container.className = `inline-email-signup inline-email-signup-${style}`;

        if (style === 'sidebar') {
            container.innerHTML = `
                <div class="inline-signup-content">
                    <div class="inline-signup-icon">📬</div>
                    <h3 class="inline-signup-title">${title}</h3>
                    <p class="inline-signup-subtitle">${subtitle}</p>
                    <form class="inline-signup-form" data-source="${source}">
                        <input type="email" placeholder="Your email" required>
                        <button type="submit" class="btn btn-primary btn-block">${buttonText}</button>
                    </form>
                    <p class="inline-signup-privacy">No spam. Unsubscribe anytime.</p>
                </div>
            `;
        } else if (style === 'compact') {
            container.innerHTML = `
                <div class="inline-signup-content compact">
                    <div class="inline-signup-text">
                        <strong>${title}</strong>
                        <span>${subtitle}</span>
                    </div>
                    <form class="inline-signup-form compact" data-source="${source}">
                        <input type="email" placeholder="Enter your email" required>
                        <button type="submit" class="btn btn-primary">${buttonText}</button>
                    </form>
                </div>
            `;
        } else {
            // Default style
            container.innerHTML = `
                <div class="inline-signup-content">
                    <div class="inline-signup-icon">🎁</div>
                    <h3 class="inline-signup-title">${title}</h3>
                    <p class="inline-signup-subtitle">${subtitle}</p>
                    <form class="inline-signup-form" data-source="${source}">
                        <div class="inline-signup-input-group">
                            <input type="email" placeholder="Enter your email address" required>
                            <button type="submit" class="btn btn-primary">${buttonText} →</button>
                        </div>
                    </form>
                    <p class="inline-signup-privacy">📧 Free templates, tips & tools • Unsubscribe anytime</p>
                </div>
            `;
        }

        // Add form handler
        const form = container.querySelector('.inline-signup-form');
        form.addEventListener('submit', handleInlineSignup);

        return container;
    }

    /**
     * Handle inline signup form submission
     */
    async function handleInlineSignup(e) {
        e.preventDefault();

        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const source = form.dataset.source || 'inline-signup';

        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';

        try {
            const response = await fetch('/api/mailerlite-subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    name: null,
                    source: source
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to subscribe');
            }

            // Mark as subscribed to prevent popup
            if (typeof emailCollector !== 'undefined') {
                emailCollector.markSubscribed();
            }

            // Show success
            submitBtn.textContent = '✓ Subscribed!';
            submitBtn.style.background = '#10b981';
            emailInput.value = '';

            // Track Pinterest lead event
            if (typeof pintrk !== 'undefined') {
                pintrk('track', 'lead', {
                    lead_type: 'Inline Email Signup',
                    value: 0,
                    currency: 'USD'
                });
            }

            // Reset after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);

        } catch (error) {
            alert(error.message || 'Failed to subscribe. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    /**
     * Auto-insert inline signup in specified containers
     * @param {string} selector - CSS selector for insertion point
     * @param {Object} options - Signup options
     * @param {string} position - 'before', 'after', 'append', 'prepend'
     */
    function autoInsertSignup(selector, options = {}, position = 'after') {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const signup = createInlineSignup(options);

            switch(position) {
                case 'before':
                    element.parentNode.insertBefore(signup, element);
                    break;
                case 'after':
                    element.parentNode.insertBefore(signup, element.nextSibling);
                    break;
                case 'append':
                    element.appendChild(signup);
                    break;
                case 'prepend':
                    element.insertBefore(signup, element.firstChild);
                    break;
            }
        });
    }

    // Make functions available globally
    window.inlineEmailSignup = {
        create: createInlineSignup,
        autoInsert: autoInsertSignup
    };

})();
