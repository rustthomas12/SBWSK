/**
 * Download Website Template as ZIP
 * Vercel Serverless Function
 * Verifies Stripe session and provides template download
 */

const Stripe = require('stripe');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    // Initialize Stripe
    const stripeSecretKey = process.env.STRIPE_MODE === 'live'
      ? process.env.STRIPE_SECRET_KEY_LIVE
      : process.env.STRIPE_SECRET_KEY_TEST;

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get session ID and product from query parameters
    const sessionId = req.query.session || '';
    const product = req.query.product || 'startup-pro';

    if (!sessionId) {
      return res.status(400).send('No session ID provided');
    }

    // Verify the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).send('Payment not completed');
    }

    // Map product IDs to template directories
    const templateMap = {
      'template-startup': 'startup-pro',
      'template-portfolio': 'portfolio',
      'template-ecommerce': 'ecommerce',
      'template-restaurant': 'restaurant',
      // Fallback
      'startup-pro': 'startup-pro'
    };

    const templateDir = templateMap[product] || templateMap[session.metadata?.product] || 'startup-pro';
    const templatesBasePath = path.join(process.cwd(), 'website-templates', templateDir);

    // Check if template directory exists
    if (!fs.existsSync(templatesBasePath)) {
      return res.status(404).send(`Template not found: ${templateDir}`);
    }

    // Log the download
    await logDownload(sessionId, templateDir);

    // Set headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${templateDir}-template.zip"`);
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      throw err;
    });

    // Pipe archive data to the response
    archive.pipe(res);

    // Add all files from the template directory recursively
    archive.directory(templatesBasePath, false);

    // Finalize the archive
    await archive.finalize();

  } catch (error) {
    console.error('Download error:', error);

    // Stripe-specific errors
    if (error.type) {
      return res.status(400).send('Invalid session. Please check your email for the correct download link.');
    }

    // General errors
    return res.status(500).send(`Error: ${error.message}`);
  }
};

/**
 * Log download to file
 */
async function logDownload(sessionId, template) {
  try {
    const fs = require('fs').promises;
    const logDir = path.join('/tmp', 'logs');
    const logFile = path.join(logDir, 'template-downloads.log');

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - Template: ${template} - Session: ${sessionId}\n`;

    await fs.appendFile(logFile, logEntry);
    console.log('Download logged successfully');
  } catch (error) {
    console.error('Error logging download:', error);
    // Don't fail the download if logging fails
  }
}
