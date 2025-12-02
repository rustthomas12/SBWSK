/**
 * Care Plan Subscription Checkout Creator
 * Creates Stripe checkout for recurring Website Care Plan subscriptions
 */

const Stripe = require('stripe');
const { subscriptions } = require('../config/products');

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
    const plan = data.plan; // 'basic', 'pro', or 'premium'

    if (!plan) {
      throw new Error('Plan selection required');
    }

    // Get subscription product
    const productId = `care-plan-${plan}`;
    const subscription = subscriptions[productId];

    if (!subscription) {
      throw new Error(`Invalid plan: ${plan}. Must be basic, pro, or premium`);
    }

    // Build success URL
    const successUrl = `${siteUrl}${subscription.success_url}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = data.cancelUrl || `${siteUrl}/website-care-plan.html`;

    // For subscriptions, we need to create or use a Price object
    // In production, you'd create these prices in Stripe Dashboard
    // For now, we'll create them on-the-fly (not recommended for production)

    // Create a Price for this subscription
    const price = await stripe.prices.create({
      currency: subscription.currency,
      unit_amount: subscription.price,
      recurring: {
        interval: subscription.interval,
      },
      product_data: {
        name: subscription.name,
        description: subscription.description,
      },
    });

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: price.id,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan: plan,
        service_type: 'care-plan',
      },
      subscription_data: {
        metadata: {
          plan: plan,
          service_type: 'care-plan',
        },
        trial_period_days: 0, // No trial by default, add if desired
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    // Return session details
    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      plan: plan,
    });

  } catch (error) {
    console.error('Care plan checkout error:', error);

    if (error.type) {
      return res.status(500).json({
        error: `Stripe error: ${error.message}`
      });
    }

    return res.status(400).json({
      error: error.message || 'Failed to create subscription checkout'
    });
  }
};
