/**
 * Send Email with Resend
 * Vercel Serverless Function
 * Sends purchase confirmation emails
 */

const { Resend } = require('resend');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supportEmail = process.env.SUPPORT_EMAIL || 'tom@lowlightdigital.com';
    const siteUrl = process.env.SITE_URL || 'https://www.sbwsk.io';

    const { to, subject, html, product, sessionId } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    // Send email
    const data = await resend.emails.send({
      from: 'SBWSK <noreply@lowlightdigital.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    // Also send notification to support
    await resend.emails.send({
      from: 'SBWSK <noreply@lowlightdigital.com>',
      to: [supportEmail],
      subject: `New Purchase: ${product || 'Unknown Product'}`,
      html: `
        <h2>New Purchase Notification</h2>
        <p><strong>Product:</strong> ${product || 'Unknown'}</p>
        <p><strong>Customer Email:</strong> ${to}</p>
        <p><strong>Session ID:</strong> ${sessionId || 'N/A'}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p><a href="${siteUrl}">View Dashboard</a></p>
      `,
    });

    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
};
