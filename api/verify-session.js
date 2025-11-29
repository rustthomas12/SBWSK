/**
 * Verify Stripe Checkout Session
 * Vercel Serverless Function
 * Returns whether a session is valid for downloading
 */

const Stripe = require('stripe');

module.exports = async (req, res) => {
  // Set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Initialize Stripe
    const stripeSecretKey = process.env.STRIPE_MODE === 'live'
      ? process.env.STRIPE_SECRET_KEY_LIVE
      : process.env.STRIPE_SECRET_KEY_TEST;

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get session ID from query parameters
    const sessionId = req.query.session_id || '';

    if (!sessionId) {
      throw new Error('No session ID provided');
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if payment was successful
    const valid = session.payment_status === 'paid';

    return res.status(200).json({
      valid: valid,
      session_id: sessionId,
      customer_email: session.customer_details?.email || session.customer_email || null,
    });

  } catch (error) {
    console.error('Session verification error:', error);

    // Stripe-specific errors
    if (error.type) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid session'
      });
    }

    // General errors
    return res.status(400).json({
      valid: false,
      error: error.message
    });
  }
};
