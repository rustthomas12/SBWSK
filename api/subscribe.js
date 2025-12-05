/**
 * Email List Subscription API
 * Collects emails and sends them to admin via Resend
 */

const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

// Store emails (in production, use a real database)
const emailList = new Map();

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
        const { email, source, name } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if already subscribed
        if (emailList.has(email.toLowerCase())) {
            return res.status(200).json({
                success: true,
                message: 'You\'re already subscribed to our email list!',
                alreadySubscribed: true
            });
        }

        // Save to email list
        emailList.set(email.toLowerCase(), {
            email: email.toLowerCase(),
            name: name || null,
            source: source || 'unknown',
            subscribedAt: new Date().toISOString()
        });

        // Send notification to admin
        await resend.emails.send({
            from: 'SBWSK Email List <noreply@smallbusinesswebsitestarterkit.com>',
            to: 'tom@lowlightdigital.com',
            subject: `New Email Subscriber - ${source || 'Website'}`,
            html: `
                <h2>New Email List Subscriber</h2>
                <p><strong>Email:</strong> ${email}</p>
                ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
                <p><strong>Source:</strong> ${source || 'Unknown'}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                <p style="color: #6b7280; font-size: 0.875rem;">
                    Total subscribers: ${emailList.size}
                </p>
            `
        });

        // Send welcome email to subscriber
        await resend.emails.send({
            from: 'SBWSK <noreply@smallbusinesswebsitestarterkit.com>',
            to: email,
            subject: 'Welcome to SBWSK - Free Tools & Resources for Your Business',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">Welcome to SBWSK! 🎉</h1>
                    </div>

                    <div style="background: #f9fafb; padding: 2rem; border-radius: 0 0 8px 8px;">
                        <p style="font-size: 1.125rem; color: #1f2937;">Hi${name ? ' ' + name : ''}!</p>

                        <p style="color: #4b5563;">Thank you for subscribing to our email list. You now have access to exclusive updates, tips, and resources for your small business website.</p>

                        <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #0ea5e9;">
                            <h3 style="margin-top: 0; color: #1f2937;">What you'll receive:</h3>
                            <ul style="color: #4b5563; line-height: 1.8;">
                                <li>Website building tips and best practices</li>
                                <li>New tool announcements and updates</li>
                                <li>Exclusive templates and resources</li>
                                <li>Special offers and discounts</li>
                            </ul>
                        </div>

                        <div style="text-align: center; margin: 2rem 0;">
                            <a href="https://smallbusinesswebsitestarterkit.com" style="background: #0ea5e9; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                                Explore Our Tools →
                            </a>
                        </div>

                        <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">
                            You're receiving this email because you subscribed at ${source || 'our website'}.<br>
                            If you didn't subscribe, you can safely ignore this email.
                        </p>
                    </div>
                </div>
            `
        });

        return res.status(200).json({
            success: true,
            message: 'Thank you for subscribing! Check your email for a welcome message.'
        });

    } catch (error) {
        console.error('Subscribe error:', error);
        return res.status(500).json({
            error: 'Failed to subscribe',
            message: error.message
        });
    }
}
