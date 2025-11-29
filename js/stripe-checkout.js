// Stripe Checkout Integration for Website Copy Kit
// Key is loaded from server config via get-stripe-key.js

// Wait for config to load, then initialize Stripe
let stripe = null;

function initStripe() {
    if (window.STRIPE_CONFIG && window.STRIPE_CONFIG.publishableKey) {
        stripe = Stripe(window.STRIPE_CONFIG.publishableKey);
        console.log('Stripe initialized in ' + window.STRIPE_CONFIG.mode + ' mode');
    } else {
        console.error('Stripe config not loaded');
    }
}

// Product Configuration
const products = {
    'copy-kit': {
        name: 'The 10-Minute Website Copy Kit',
        price: 1700, // $17.00 in cents
        currency: 'usd',
        description: 'Professional website copy templates - Homepage, About, Services, Contact, and SEO Meta Tags',
        images: ['https://yoursite.com/images/copy-kit-preview.png'], // Optional: add product image
    }
};

// Initialize checkout button
function initializeCheckout() {
    // First initialize Stripe
    initStripe();

    const checkoutButton = document.getElementById('checkout-button');

    if (checkoutButton) {
        checkoutButton.addEventListener('click', function(e) {
            e.preventDefault();

            if (!stripe) {
                alert('Payment system is loading. Please try again in a moment.');
                initStripe();
                return;
            }

            handleCheckout('copy-kit');
        });
    }
}

// Handle Stripe Checkout
async function handleCheckout(productKey) {
    const product = products[productKey];

    if (!product) {
        console.error('Product not found');
        return;
    }

    try {
        // Show loading state
        const button = document.getElementById('checkout-button');
        const originalText = button.innerHTML;
        button.innerHTML = 'Processing...';
        button.disabled = true;

        // Create checkout session
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product: productKey,
                productName: product.name,
                price: product.price,
                currency: product.currency,
                description: product.description,
                successUrl: window.location.origin + '/copy-kit-success.html?session_id={CHECKOUT_SESSION_ID}',
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
        console.error('Error:', error);
        alert('There was an error processing your payment. Please try again or contact support.');

        // Reset button
        const button = document.getElementById('checkout-button');
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCheckout);
} else {
    initializeCheckout();
}
