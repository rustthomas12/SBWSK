/**
 * Stripe Webhook Handler
 * Vercel Serverless Function
 * Handles Stripe events like successful payments
 * Set this URL in your Stripe Dashboard: https://dashboard.stripe.com/webhooks
 */

const Stripe = require('stripe');
const fs = require('fs').promises;
const path = require('path');
const { Resend } = require('resend');

module.exports = async (req, res) => {
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

    // Get webhook signing secret
    const endpointSecret = process.env.STRIPE_MODE === 'live'
      ? process.env.STRIPE_WEBHOOK_SECRET_LIVE
      : process.env.STRIPE_WEBHOOK_SECRET_TEST;

    // Get the signature from headers
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      // Verify webhook signature
      // Note: Vercel automatically parses the body, but Stripe needs raw body
      // We need to get the raw body for signature verification
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;

        // Get customer information
        const customerEmail = session.customer_details?.email || session.customer_email;
        const sessionId = session.id;
        const product = session.metadata?.product || 'unknown';

        // Log the purchase
        await logPurchase(product, customerEmail, sessionId);

        // Send email with download link
        if (customerEmail) {
          await sendDownloadEmail(customerEmail, sessionId, product);
        }

        console.log(`Purchase completed: ${product}, Email: ${customerEmail}, Session: ${sessionId}`);
        break;

      case 'payment_intent.succeeded':
        // Payment succeeded
        console.log('Payment succeeded:', event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        // Payment failed
        console.log('Payment failed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 response to acknowledge receipt of the event
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Log purchase to file
 */
async function logPurchase(product, email, sessionId) {
  try {
    const logDir = path.join('/tmp', 'logs');
    const logFile = path.join(logDir, 'purchases.log');

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - Purchase: ${product}, Email: ${email}, Session: ${sessionId}\n`;

    await fs.appendFile(logFile, logEntry);
    console.log('Purchase logged successfully');
  } catch (error) {
    console.error('Error logging purchase:', error);
  }
}

/**
 * Send email with download link using Resend
 */
async function sendDownloadEmail(email, sessionId, product) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = process.env.SITE_URL || 'https://www.sbwsk.io';
    const supportEmail = process.env.SUPPORT_EMAIL || 'tom@lowlightdigital.com';

    let downloadUrl, subject, productName, emailHtml;

    // Customize email based on product
    if (product === 'copy-kit') {
      downloadUrl = `${siteUrl}/copy-kit-success.html?session_id=${sessionId}`;
      subject = 'Your 10-Minute Website Copy Kit is Ready!';
      productName = 'The 10-Minute Website Copy Kit';

      emailHtml = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Thank You for Your Purchase!</h1>
            </div>
            <div class="content">
              <h2>Your Copy Kit is Ready to Download</h2>
              <p>Thanks for purchasing The 10-Minute Website Copy Kit! You now have everything you need to create professional website copy in minutes.</p>

              <p><strong>What's Included:</strong></p>
              <ul>
                <li>✓ <strong>Professional PDF Templates</strong> - Beautifully formatted and easy to fill out</li>
                <li>✓ Homepage Template PDF - Complete fill-in-the-blank guide</li>
                <li>✓ Quick Start Guide PDF - Tips, best practices, and instructions</li>
                <li>✓ About, Services, Contact & SEO templates (TXT format)</li>
                <li>✓ BONUS: Pre-launch checklist and power words guide</li>
              </ul>

              <p style="text-align: center;">
                <a href="${downloadUrl}" class="button">Download Your Templates Now →</a>
              </p>

              <p><strong>Getting Started:</strong></p>
              <ol>
                <li>Click the button above to access your download page</li>
                <li>Download the ZIP file with all templates</li>
                <li>Open the QUICK-START-GUIDE.md for instructions</li>
                <li>Fill in the blanks in each template</li>
                <li>Copy and paste to your website</li>
              </ol>

              <p><strong>Need Help?</strong></p>
              <p>If you have any questions or issues, email us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>

              <p>Here's to your success! 🚀</p>
              <p>- The SBWSK Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Small Business Website Starter Kit</p>
              <p>Questions? Reply to this email or contact ${supportEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (product === 'premium-logo') {
      downloadUrl = `${siteUrl}/premium-logo-success.html?session_id=${sessionId}`;
      subject = 'Premium Logo Design - Order Confirmed!';
      productName = 'Premium Logo Design Service';

      emailHtml = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Thank You for Your Premium Logo Purchase</h2>
              <p>We're excited to create a professional logo for your business!</p>

              <p><strong>What Happens Next:</strong></p>
              <ol>
                <li><strong>We'll contact you within 24 hours</strong> to discuss your logo requirements</li>
                <li><strong>Design process begins</strong> - we'll create custom designs based on your vision</li>
                <li><strong>Unlimited revisions</strong> until you're completely satisfied</li>
                <li><strong>Final delivery</strong> - high-resolution files in multiple formats</li>
              </ol>

              <p style="text-align: center;">
                <a href="${downloadUrl}" class="button">View Order Details</a>
              </p>

              <p><strong>What You'll Receive:</strong></p>
              <ul>
                <li>✓ Professional custom logo design</li>
                <li>✓ High-resolution PNG & SVG files</li>
                <li>✓ Multiple format options</li>
                <li>✓ Full commercial usage rights</li>
                <li>✓ Unlimited revisions</li>
              </ul>

              <p><strong>Have Questions?</strong></p>
              <p>Email us anytime at <a href="mailto:${supportEmail}">${supportEmail}</a></p>

              <p>Looking forward to creating your perfect logo! 🎨</p>
              <p>- The SBWSK Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Small Business Website Starter Kit</p>
              <p>Contact: ${supportEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // Generic template purchase email
      downloadUrl = `${siteUrl}/template-success.html?session_id=${sessionId}`;
      subject = 'Your Template Purchase - Order Confirmed!';
      productName = 'Website Template';

      emailHtml = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Thank You for Your Purchase!</h1>
            </div>
            <div class="content">
              <h2>Your Order is Confirmed</h2>
              <p>Thank you for purchasing from SBWSK!</p>

              <p style="text-align: center;">
                <a href="${downloadUrl}" class="button">View Order Details</a>
              </p>

              <p>We'll be in touch within 24 hours with next steps.</p>

              <p><strong>Questions?</strong></p>
              <p>Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>

              <p>Thank you for your business! 🚀</p>
              <p>- The SBWSK Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Small Business Website Starter Kit</p>
              <p>Contact: ${supportEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send customer email
    await resend.emails.send({
      from: 'SBWSK <noreply@lowlightdigital.com>',
      to: [email],
      subject: subject,
      html: emailHtml,
    });

    // Send notification to support
    await resend.emails.send({
      from: 'SBWSK <noreply@lowlightdigital.com>',
      to: [supportEmail],
      subject: `New Purchase: ${productName}`,
      html: `
        <h2>New Purchase Notification</h2>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Session ID:</strong> ${sessionId}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p><a href="${downloadUrl}">View Order</a></p>
      `,
    });

    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - we don't want to fail the webhook if email fails
  }
}
