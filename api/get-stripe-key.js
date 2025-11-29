/**
 * Get Stripe Publishable Key
 * Vercel Serverless Function
 * Returns the publishable key for client-side use
 */

module.exports = async (req, res) => {
  // Set headers for JavaScript response
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');

  // Get environment variables
  const publishableKey = process.env.STRIPE_MODE === 'live'
    ? process.env.STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.STRIPE_PUBLISHABLE_KEY_TEST;

  const siteUrl = process.env.SITE_URL || 'https://www.sbwsk.io';
  const mode = process.env.STRIPE_MODE || 'test';

  // Output JavaScript with the publishable key
  const output = `window.STRIPE_CONFIG = {
    publishableKey: '${publishableKey}',
    siteUrl: '${siteUrl}',
    mode: '${mode}'
};`;

  res.status(200).send(output);
};
