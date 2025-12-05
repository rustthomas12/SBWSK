/**
 * Email List Collector
 * Shows popup after users complete actions (download, use tools, etc.)
 */

(function() {
    'use strict';

    // Check if user has already subscribed
    function hasSubscribed() {
        return localStorage.getItem('emailSubscribed') === 'true';
    }

    // Mark user as subscribed
    function markSubscribed() {
        localStorage.setItem('emailSubscribed', 'true');
    }

    // Create email popup HTML
    function createEmailPopup(options = {}) {
        const {
            title = 'Love our tools? Get more!',
            message = 'Join our email list for exclusive tips, templates, and updates for your small business website.',
            source = 'popup'
        } = options;

        const popup = document.createElement('div');
        popup.id = 'emailPopup';
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        popup.innerHTML = `
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>
            <div style="
                background: white;
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                padding: 2.5rem;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                position: relative;
                animation: slideUp 0.3s ease;
            ">
                <button id="closeEmailPopup" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #9ca3af;
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#f3f4f6'; this.style.color='#1f2937';" onmouseout="this.style.background='none'; this.style.color='#9ca3af';">
                    ×
                </button>

                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="
                        width: 64px;
                        height: 64px;
                        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 1rem;
                        font-size: 2rem;
                    ">📧</div>
                    <h2 style="margin: 0 0 0.5rem 0; color: #1f2937; font-size: 1.5rem;">${title}</h2>
                    <p style="color: #6b7280; margin: 0;">${message}</p>
                </div>

                <form id="emailSubscribeForm">
                    <div style="margin-bottom: 1rem;">
                        <input type="text" id="subscribeName" placeholder="Your Name (optional)" style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                            transition: border-color 0.2s;
                        " onfocus="this.style.borderColor='#0ea5e9';" onblur="this.style.borderColor='#e5e7eb';">
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <input type="email" id="subscribeEmail" placeholder="Enter your email" required style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                            transition: border-color 0.2s;
                        " onfocus="this.style.borderColor='#0ea5e9';" onblur="this.style.borderColor='#e5e7eb';">
                    </div>

                    <button type="submit" style="
                        width: 100%;
                        padding: 0.875rem;
                        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';">
                        Subscribe for Free
                    </button>
                </form>

                <p style="
                    text-align: center;
                    color: #9ca3af;
                    font-size: 0.75rem;
                    margin-top: 1rem;
                    margin-bottom: 0;
                ">
                    No spam. Unsubscribe anytime.
                </p>
            </div>
        `;

        return popup;
    }

    // Show email popup
    function showEmailPopup(options = {}) {
        // Don't show if already subscribed
        if (hasSubscribed()) {
            return;
        }

        // Don't show if popup already exists
        if (document.getElementById('emailPopup')) {
            return;
        }

        const popup = createEmailPopup(options);
        document.body.appendChild(popup);

        // Close button handler
        document.getElementById('closeEmailPopup').addEventListener('click', () => {
            popup.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => popup.remove(), 300);
        });

        // Click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => popup.remove(), 300);
            }
        });

        // Form submission
        document.getElementById('emailSubscribeForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('subscribeEmail').value;
            const name = document.getElementById('subscribeName').value;
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';

            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        name: name || null,
                        source: options.source || 'popup'
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to subscribe');
                }

                // Mark as subscribed
                markSubscribed();

                // Show success message
                submitBtn.textContent = '✓ Subscribed!';
                submitBtn.style.background = '#10b981';

                // Track Pinterest lead event
                if (typeof pintrk !== 'undefined') {
                    pintrk('track', 'lead', {
                        lead_type: 'Email Subscription',
                        value: 0,
                        currency: 'USD'
                    });
                }

                // Close popup after 2 seconds
                setTimeout(() => {
                    popup.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => popup.remove(), 300);
                }, 2000);

            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                alert(error.message || 'Failed to subscribe. Please try again.');
            }
        });
    }

    // Trigger popup after tool usage
    function triggerAfterToolUse(toolName, delay = 2000) {
        if (hasSubscribed()) return;

        setTimeout(() => {
            showEmailPopup({
                title: `Enjoyed the ${toolName}?`,
                message: 'Get more free tools, tips, and resources delivered to your inbox.',
                source: toolName
            });
        }, delay);
    }

    // Trigger on exit intent
    function setupExitIntent() {
        if (hasSubscribed()) return;

        let triggered = false;
        document.addEventListener('mouseleave', (e) => {
            if (!triggered && e.clientY <= 0) {
                triggered = true;
                showEmailPopup({
                    title: 'Before you go...',
                    message: 'Join our email list and never miss new tools, templates, and tips!',
                    source: 'exit-intent'
                });
            }
        });
    }

    // Make functions available globally
    window.emailCollector = {
        show: showEmailPopup,
        triggerAfterToolUse,
        setupExitIntent,
        hasSubscribed,
        markSubscribed
    };

})();
