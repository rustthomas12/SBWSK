/**
 * Contact Form API
 * Sends contact form submissions via email using Resend
 */

const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, message, subject, phone } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Send email to admin
        await resend.emails.send({
            from: 'SBWSK Contact Form <noreply@smallbusinesswebsitestarterkit.com>',
            to: 'tom@lowlightdigital.com',
            replyTo: email,
            subject: subject || `New Contact Form Submission from ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                <h3>Message:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>Reply directly to this email to respond to ${name}</em></p>
            `
        });

        // Send confirmation to user
        await resend.emails.send({
            from: 'SBWSK <noreply@smallbusinesswebsitestarterkit.com>',
            to: email,
            subject: 'We received your message - SBWSK',
            html: `
                <h2>Thank you for contacting us!</h2>
                <p>Hi ${name},</p>
                <p>We've received your message and will get back to you as soon as possible.</p>
                <h3>Your message:</h3>
                <p style="background: #f3f4f6; padding: 15px; border-radius: 6px;">${message.replace(/\n/g, '<br>')}</p>
                <p>Best regards,<br>SBWSK Team</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: 'Message sent successfully! We\'ll get back to you soon.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({
            error: 'Failed to send message',
            message: error.message
        });
    }
}
