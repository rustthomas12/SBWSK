// Accessibility Enhancements
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {

        // Skip to main content link
        addSkipLink();

        // Enhance keyboard navigation
        enhanceKeyboardNav();

        // Add focus visible indicators
        addFocusIndicators();

        // Announce dynamic content changes to screen readers
        setupLiveRegions();

        // Improve form accessibility
        enhanceFormAccessibility();
    });

    // Add skip to main content link
    function addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--primary-color, #0ea5e9);
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 0 0 4px 0;
            z-index: 10000;
            transition: top 0.3s;
        `;

        skipLink.addEventListener('focus', function() {
            this.style.top = '0';
        });

        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add ID to main content if not exists
        const main = document.querySelector('main') || document.querySelector('.hero, .page-hero');
        if (main && !main.id) {
            main.id = 'main-content';
            main.setAttribute('tabindex', '-1');
        }
    }

    // Enhance keyboard navigation
    function enhanceKeyboardNav() {
        // Escape key closes mobile menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const navMenu = document.querySelector('.nav-menu.active');
                if (navMenu) {
                    navMenu.classList.remove('active');
                    document.getElementById('navToggle')?.focus();
                }

                // Close any open FAQ items
                const activeFaq = document.querySelector('.faq-item.active');
                if (activeFaq) {
                    activeFaq.classList.remove('active');
                }
            }
        });

        // Trap focus in mobile menu when open
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                const isExpanded = navMenu.classList.contains('active');
                this.setAttribute('aria-expanded', isExpanded);
            });
        }
    }

    // Add visible focus indicators
    function addFocusIndicators() {
        // Add focus-visible class for better focus indicators
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-nav');
        });

        // Add CSS for keyboard navigation
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-nav *:focus {
                outline: 3px solid #0ea5e9 !important;
                outline-offset: 2px !important;
            }

            .keyboard-nav button:focus,
            .keyboard-nav a:focus,
            .keyboard-nav input:focus,
            .keyboard-nav select:focus,
            .keyboard-nav textarea:focus {
                box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Setup ARIA live regions for dynamic content
    function setupLiveRegions() {
        // Create a live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);

        // Announce form submissions
        window.announceToScreenReader = function(message) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        };
    }

    // Enhance form accessibility
    function enhanceFormAccessibility() {
        // Associate labels with inputs
        const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && !input.id) {
                const label = input.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    const id = 'input-' + Math.random().toString(36).substr(2, 9);
                    input.id = id;
                    label.setAttribute('for', id);
                }
            }

            // Add aria-required for required fields
            if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
                input.setAttribute('aria-required', 'true');
            }

            // Add aria-invalid for invalid fields
            input.addEventListener('invalid', function() {
                this.setAttribute('aria-invalid', 'true');
            });

            input.addEventListener('input', function() {
                if (this.validity.valid) {
                    this.removeAttribute('aria-invalid');
                }
            });
        });

        // Add descriptive labels to form buttons
        const submitButtons = document.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
            if (!button.getAttribute('aria-label')) {
                const form = button.closest('form');
                const formId = form?.id || 'form';
                button.setAttribute('aria-label', `Submit ${formId}`);
            }
        });
    }

    // Add ARIA labels to navigation
    const navs = document.querySelectorAll('nav');
    navs.forEach((nav, index) => {
        if (!nav.getAttribute('aria-label')) {
            nav.setAttribute('aria-label', index === 0 ? 'Main navigation' : `Navigation ${index + 1}`);
        }
    });

    // Add ARIA labels to external links
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        const currentLabel = link.getAttribute('aria-label') || link.textContent;
        link.setAttribute('aria-label', `${currentLabel} (opens in new window)`);
    });

})();
