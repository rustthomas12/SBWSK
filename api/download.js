/**
 * Download Copy Kit Templates as ZIP
 * Vercel Serverless Function
 * Verifies session and provides download
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

    // Get session ID from query parameters
    const sessionId = req.query.session || '';

    if (!sessionId) {
      return res.status(400).send('No session ID provided');
    }

    // Verify the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).send('Payment not completed');
    }

    // Log the download
    await logDownload(sessionId);

    // Set headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="copy-kit-templates.zip"');
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

    // Add all template files
    const templatesDir = path.join(process.cwd(), 'copy-kit-templates');
    const files = [
      '1-homepage-template.txt',
      '2-about-page-template.txt',
      '3-services-page-template.txt',
      '4-contact-page-template.txt',
      '5-seo-meta-tags-template.txt',
      'README.txt'
    ];

    for (const file of files) {
      const filePath = path.join(templatesDir, file);

      // Check if file exists
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file });
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    }

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
async function logDownload(sessionId) {
  try {
    const fs = require('fs').promises;
    const logDir = path.join('/tmp', 'logs');
    const logFile = path.join(logDir, 'downloads.log');

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - Download: Session ${sessionId}\n`;

    await fs.appendFile(logFile, logEntry);
    console.log('Download logged successfully');
  } catch (error) {
    console.error('Error logging download:', error);
    // Don't fail the download if logging fails
  }
}
