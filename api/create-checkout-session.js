/**
 * Stripe Checkout Session Creator
 * Vercel Serverless Function
 * Creates a Stripe checkout session for products
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
    // Initialize Stripe with secret key
    const stripeSecretKey = process.env.STRIPE_MODE === 'live'
      ? process.env.STRIPE_SECRET_KEY_LIVE
      : process.env.STRIPE_SECRET_KEY_TEST;

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const siteUrl = process.env.SITE_URL || 'https://www.sbwsk.io';

    // Get request data
    const data = req.body;

    if (!data) {
      throw new Error('Invalid request data');
    }

    // Get product ID
    const productId = data.product;
    if (!productId) {
      throw new Error('Product ID required');
    }

    let productName, price, currency, description, successUrl;

    // Check if product exists in config
    if (products[productId]) {
      const product = products[productId];
      productName = product.name;
      price = data.customPrice || product.price;
      currency = product.currency;
      description = product.description;
      successUrl = data.successUrl || `${siteUrl}${product.success_url}?session_id={CHECKOUT_SESSION_ID}`;
    } else {
      // Fallback for custom products
      const requiredFields = ['productName', 'price', 'currency', 'successUrl', 'cancelUrl'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      productName = data.productName;
      price = data.price;
      currency = data.currency;
      description = data.description || '';
      successUrl = data.successUrl;
    }

    const cancelUrl = data.cancelUrl || siteUrl;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: productName,
            description: description,
            images: data.images || [],
          },
          unit_amount: price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product: productId,
      },
      customer_email: data.email || null,
      allow_promotion_codes: true,
    });

    // Return session ID and URL
    return res.status(200).json({
      id: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Checkout session error:', error);

    // Stripe-specific errors
    if (error.type) {
      return res.status(500).json({
        error: `Stripe error: ${error.message}`
      });
    }

    // General errors
    return res.status(400).json({
      error: error.message
    });
  }
};
