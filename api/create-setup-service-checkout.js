/**
 * Setup Service Checkout Session Creator
 * Creates Stripe checkout for Done-For-You Setup Service
 */

const Stripe = require('stripe');
const products = require('../config/products');

module.exports = async (req, res) => {
  // Set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = process.env.STRIPE_MODE === 'live'
      ? process.env.STRIPE_SECRET_KEY_LIVE
      : process.env.STRIPE_SECRET_KEY_TEST;

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const siteUrl = process.env.SITE_URL || 'https://www.sbwsk.io';

    // Get request data
    const data = req.body || {};

    // Determine which product variant (regular or upsell)
    const isUpsell = data.isUpsell === true;
    const productId = isUpsell ? 'setup-service-upsell' : 'setup-service';
    const product = products[productId];

    if (!product) {
      throw new Error('Product not found');
    }

    // Build success URL
    const successUrl = `${siteUrl}${product.success_url}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = data.cancelUrl || `${siteUrl}/setup-service.html`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product: productId,
        service_type: 'setup-service',
        is_upsell: isUpsell.toString(),
      },
      allow_promotion_codes: true,
      // Collect customer information for service delivery
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    // Return session details
    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Setup service checkout error:', error);

    if (error.type) {
      return res.status(500).json({
        error: `Stripe error: ${error.message}`
      });
    }

    return res.status(400).json({
      error: error.message || 'Failed to create checkout session'
    });
  }
};
