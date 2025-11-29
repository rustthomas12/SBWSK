/**
 * Universal Stripe Checkout System
 * Works for any product on the site
 *
 * Usage:
 * <button class="stripe-checkout-btn" data-product="copy-kit">Buy Now</button>
 */

let stripe = null;

// Initialize Stripe when config loads
function initStripe() {
    if (window.STRIPE_CONFIG && window.STRIPE_CONFIG.publishableKey) {
        stripe = Stripe(window.STRIPE_CONFIG.publishableKey);
        console.log('Stripe initialized in ' + window.STRIPE_CONFIG.mode + ' mode');
        return true;
    }
    return false;
}

// Initialize all checkout buttons on the page
function initUniversalCheckout() {
    // Initialize Stripe first
    initStripe();

    // Find all checkout buttons
    const checkoutButtons = document.querySelectorAll('.stripe-checkout-btn, [data-product]');

    checkoutButtons.forEach(button => {
        const productId = button.getAttribute('data-product');
        const customPrice = button.getAttribute('data-price'); // Optional custom price
        const customName = button.getAttribute('data-product-name'); // Optional custom name

        if (productId) {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                if (!stripe) {
                    alert('Payment system is loading. Please try again in a moment.');
                    initStripe();
                    return;
                }

                // Show loading state
                const originalText = button.innerHTML;
                button.innerHTML = 'Processing...';
                button.disabled = true;

                // Start checkout
                handleCheckout(productId, customPrice, customName)
                    .catch(error => {
                        console.error('Checkout error:', error);
                        alert('There was an error. Please try again or contact support.');
                    })
                    .finally(() => {
                        button.innerHTML = originalText;
                        button.disabled = false;
                    });
            });
        }
    });

    console.log(`Initialized ${checkoutButtons.length} checkout buttons`);
}

// Handle checkout for any product
async function handleCheckout(productId, customPrice, customName) {
    try {
        // Create checkout session
        const response = await fetch('/api/create-checkout-session.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product: productId,
                customPrice: customPrice ? parseInt(customPrice) : null,
                customName: customName || null,
                successUrl: window.location.origin + '/payment-success.html?session_id={CHECKOUT_SESSION_ID}&product=' + productId,
                cancelUrl: window.location.href
            })
        });

        const session = await response.json();

        if (session.error) {
            throw new Error(session.error);
        }

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

    } catch (error) {
        console.error('Checkout error:', error);
        throw error;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalCheckout);
} else {
    initUniversalCheckout();
}

// Export for manual initialization if needed
window.initUniversalCheckout = initUniversalCheckout;
window.handleCheckout = handleCheckout;
