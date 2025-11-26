// Cookie Consent Banner
(function() {
    'use strict';

    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');

    if (cookieConsent === null) {
        showCookieBanner();
    }

    function showCookieBanner() {
        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h3>🍪 We Value Your Privacy</h3>
                    <p>We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Accept All", you consent to our use of cookies.</p>
                </div>
                <div class="cookie-consent-buttons">
                    <button id="cookie-accept-all" class="btn btn-primary">Accept All</button>
                    <button id="cookie-reject" class="btn btn-secondary">Reject Non-Essential</button>
                    <a href="privacy-policy.html" class="cookie-learn-more">Learn More</a>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('cookie-accept-all').addEventListener('click', function() {
            acceptCookies(true);
        });

        document.getElementById('cookie-reject').addEventListener('click', function() {
            acceptCookies(false);
        });

        // Show banner with animation
        setTimeout(() => {
            banner.classList.add('show');
        }, 500);
    }

    function acceptCookies(accept) {
        localStorage.setItem('cookieConsent', accept.toString());

        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }

        if (accept) {
            // Dispatch event to load analytics
            window.dispatchEvent(new Event('cookieConsentGranted'));
        }
    }

    // Expose function to revoke consent
    window.revokeCookieConsent = function() {
        localStorage.removeItem('cookieConsent');
        location.reload();
    };

})();
