/**
 * Send Order Confirmation Email
 * Triggered by Stripe webhook or manually
 * Uses Resend API for email delivery
 */

const { Resend } = require('resend');

module.exports = async (req, res) => {
  try {
    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get order details from request
    const {
      customerEmail,
      customerName,
      product,
      productName,
      amount,
      sessionId,
      downloadUrl
    } = req.body;

    if (!customerEmail || !product) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Email templates based on product type
    const emailTemplates = {
      'copy-kit': {
        subject: '📦 Your Website Copy Kit is Ready to Download!',
        html: `
          <h2>Thank you for your purchase!</h2>
          <p>Hi ${customerName || 'there'},</p>
          <p>Your <strong>10-Minute Website Copy Kit</strong> is ready to download.</p>

          <p style="margin: 30px 0;">
            <a href="${downloadUrl || 'https://www.sbwsk.io/copy-kit-success.html?session_id=' + sessionId}"
               style="background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Download Your Copy Kit
            </a>
          </p>

          <h3>What's Included:</h3>
          <ul>
            <li>Homepage Template</li>
            <li>About Page Template</li>
            <li>Services Page Template</li>
            <li>Contact Page Template</li>
            <li>SEO Meta Tags Template</li>
            <li>Quick Start Guide</li>
          </ul>

          <p><strong>Need help installing your copy?</strong><br>
          Check out our <a href="https://www.sbwsk.io/setup-service.html">Done-For-You Setup Service</a> ($397)</p>

          <p>Questions? Reply to this email!</p>
          <p>- The SBWSK Team</p>
        `
      },

      'template-startup': {
        subject: '🚀 Your Startup Pro Template is Ready!',
        html: `
          <h2>Thank you for your purchase!</h2>
          <p>Hi ${customerName || 'there'},</p>
          <p>Your <strong>Startup Pro Website Template</strong> is ready to download.</p>

          <p style="margin: 30px 0;">
            <a href="${downloadUrl || 'https://www.sbwsk.io/template-success.html?session_id=' + sessionId}"
               style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Download Your Template
            </a>
          </p>

          <h3>Quick Start:</h3>
          <ol>
            <li>Download and extract the ZIP file</li>
            <li>Customize the HTML files with your content</li>
            <li>Upload to your web hosting</li>
            <li>Launch!</li>
          </ol>

          <p><strong>Need help setting it up?</strong><br>
          Our <a href="https://www.sbwsk.io/setup-service.html">Setup Service</a> will install and customize it for you ($397)</p>

          <p>Questions? Reply to this email!</p>
          <p>- The SBWSK Team</p>
        `
      },

      'premium-logo': {
        subject: '🎨 Your Premium Logo Design Has Started!',
        html: `
          <h2>Thank you for your order!</h2>
          <p>Hi ${customerName || 'there'},</p>
          <p>We're excited to create your custom logo!</p>

          <h3>Next Steps:</h3>
          <ol>
            <li><strong>Complete Your Design Brief</strong><br>
                <a href="https://www.sbwsk.io/premium-logo-success.html?session_id=${sessionId}">Click here</a> to tell us about your brand, colors, and style preferences.</li>
            <li><strong>Initial Concepts (3-5 days)</strong><br>
                We'll send you 3 unique logo concepts based on your brief.</li>
            <li><strong>Unlimited Revisions</strong><br>
                We'll refine your chosen design until it's perfect.</li>
            <li><strong>Final Files</strong><br>
                Receive your logo in PNG, JPEG, SVG, and favicon formats.</li>
          </ol>

          <p><strong>Typical Timeline:</strong> 7-10 business days</p>

          <p style="margin: 30px 0;">
            <a href="https://www.sbwsk.io/premium-logo-success.html?session_id=${sessionId}"
               style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Complete Design Brief
            </a>
          </p>

          <p>Questions? Reply to this email anytime!</p>
          <p>- The SBWSK Design Team</p>
        `
      },

      'setup-service': {
        subject: '⚡ Your Website Setup Service is Confirmed!',
        html: `
          <h2>Let's build your website!</h2>
          <p>Hi ${customerName || 'there'},</p>
          <p>Your <strong>Done-For-You Website Setup Service</strong> is confirmed.</p>

          <h3>What Happens Next:</h3>
          <ol>
            <li><strong>Within 1 Hour:</strong> You'll receive a detailed questionnaire</li>
            <li><strong>24-48 Hours:</strong> We'll build and customize your website</li>
            <li><strong>Review & Launch:</strong> You approve, we launch!</li>
          </ol>

          <p><strong>We'll need from you:</strong></p>
          <ul>
            <li>Hosting login credentials</li>
            <li>Template choice (or we'll help you pick)</li>
            <li>Your logo and brand colors</li>
            <li>Website copy/content</li>
            <li>Images</li>
          </ul>

          <p style="margin: 30px 0;">
            <a href="https://www.sbwsk.io/setup-service-success.html?session_id=${sessionId}"
               style="background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Full Timeline
            </a>
          </p>

          <p><strong>Don't have hosting yet?</strong><br>
          We recommend <a href="https://bluehost.sjv.io/Webstarterkit">Bluehost</a> (starts at $2.95/month)</p>

          <p>Questions? Reply to this email!</p>
          <p>- The SBWSK Team</p>
        `
      },

      'care-plan-basic': {
        subject: '🛡️ Welcome to Your Website Care Plan!',
        html: generateCarePlanEmail(customerName, 'Basic', '$39/month', sessionId)
      },

      'care-plan-pro': {
        subject: '🛡️ Welcome to Your Website Care Plan!',
        html: generateCarePlanEmail(customerName, 'Pro', '$79/month', sessionId)
      },

      'care-plan-premium': {
        subject: '🛡️ Welcome to Your Website Care Plan!',
        html: generateCarePlanEmail(customerName, 'Premium', '$149/month', sessionId)
      }
    };

    // Get email template
    const template = emailTemplates[product] || {
      subject: 'Order Confirmation - SBWSK',
      html: `
        <h2>Thank you for your purchase!</h2>
        <p>Hi ${customerName || 'there'},</p>
        <p>Your order for <strong>${productName}</strong> has been confirmed.</p>
        <p>Order ID: ${sessionId}</p>
        <p>Amount: $${(amount / 100).toFixed(2)}</p>
        <p>Questions? Reply to this email!</p>
        <p>- The SBWSK Team</p>
      `
    };

    // Send email
    const data = await resend.emails.send({
      from: 'SBWSK <noreply@sbwsk.io>',
      to: [customerEmail],
      subject: template.subject,
      html: template.html,
    });

    return res.status(200).json({
      success: true,
      messageId: data.id
    });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Helper function for care plan emails
function generateCarePlanEmail(name, plan, price, sessionId) {
  return `
    <h2>Welcome to your ${plan} Care Plan!</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Thank you for subscribing to the <strong>Website Care Plan - ${plan}</strong> (${price}).</p>

    <h3>What's Included:</h3>
    <ul>
      <li>✓ Monthly speed & performance checks</li>
      <li>✓ Security monitoring & updates</li>
      <li>✓ Automatic backups</li>
      <li>✓ Uptime monitoring</li>
      ${plan !== 'Basic' ? '<li>✓ Monthly update hours</li>' : ''}
      ${plan === 'Premium' ? '<li>✓ Priority support</li>' : ''}
    </ul>

    <h3>What Happens Next:</h3>
    <ol>
      <li><strong>Initial Audit (48 hours):</strong> Complete site health check</li>
      <li><strong>Setup:</strong> Configure monitoring and backups</li>
      <li><strong>Monthly Reports:</strong> Performance and security updates</li>
    </ol>

    <p style="margin: 30px 0;">
      <a href="https://www.sbwsk.io/care-plan-success.html?session_id=${sessionId}"
         style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
        View Full Details
      </a>
    </p>

    <p><strong>Manage Your Subscription:</strong><br>
    You can update your payment method or cancel anytime through your customer portal.</p>

    <p>Questions? Reply to this email!</p>
    <p>- The SBWSK Team</p>
  `;
}
