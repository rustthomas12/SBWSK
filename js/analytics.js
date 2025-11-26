// Google Analytics Configuration
// Replace 'G-XXXXXXXXXX' with your actual Google Analytics Measurement ID

(function() {
    'use strict';

    // Google Analytics 4 (GA4) - Add your measurement ID here
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual ID

    // Load Google Analytics
    function loadGoogleAnalytics() {
        // Check if user has consented to cookies
        if (getCookieConsent()) {
            // Create script tag for gtag.js
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
            document.head.appendChild(script);

            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

            gtag('js', new Date());
            gtag('config', GA_MEASUREMENT_ID, {
                'anonymize_ip': true, // Anonymize IP for GDPR compliance
                'cookie_flags': 'SameSite=None;Secure'
            });

            console.log('Google Analytics loaded');
        }
    }

    // Check cookie consent
    function getCookieConsent() {
        return localStorage.getItem('cookieConsent') === 'true';
    }

    // Track custom events
    window.trackEvent = function(category, action, label, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label,
                'value': value
            });
        }
    };

    // Track page views
    window.trackPageView = function(pagePath) {
        if (typeof gtag !== 'undefined') {
            gtag('config', GA_MEASUREMENT_ID, {
                'page_path': pagePath
            });
        }
    };

    // Auto-track button clicks
    document.addEventListener('DOMContentLoaded', function() {
        // Track CTA button clicks
        document.querySelectorAll('.btn-primary, .btn-cta').forEach(button => {
            button.addEventListener('click', function(e) {
                const buttonText = this.textContent.trim();
                trackEvent('CTA', 'click', buttonText);
            });
        });

        // Track external links
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.addEventListener('click', function(e) {
                trackEvent('Outbound Link', 'click', this.href);
            });
        });

        // Track form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                const formId = this.id || 'unknown-form';
                trackEvent('Form', 'submit', formId);
            });
        });
    });

    // Load analytics if consent is given
    if (getCookieConsent()) {
        loadGoogleAnalytics();
    }

    // Listen for consent changes
    window.addEventListener('cookieConsentGranted', function() {
        loadGoogleAnalytics();
    });

})();
