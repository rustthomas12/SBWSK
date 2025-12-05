/**
 * MailerLite Email List Subscription API
 * Professional email marketing integration with automated sequences
 */

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID; // Optional: specific group/segment

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
        const { email, name, source } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (!MAILERLITE_API_KEY) {
            throw new Error('MailerLite API key not configured');
        }

        // Split name into first and last (if provided)
        let firstName = '';
        let lastName = '';
        if (name) {
            const nameParts = name.trim().split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }

        // Prepare subscriber data
        const subscriberData = {
            email: email.toLowerCase(),
            fields: {
                name: name || '',
                last_name: lastName,
                source: source || 'website'
            },
            status: 'active', // Automatically active (no double opt-in for lead magnets)
            resubscribe: true, // Resubscribe if they previously unsubscribed
        };

        // Add to specific group if configured
        if (MAILERLITE_GROUP_ID) {
            subscriberData.groups = [MAILERLITE_GROUP_ID];
        }

        // Add subscriber to MailerLite using v2 API
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(subscriberData)
        });

        const data = await response.json();

        if (!response.ok) {
            // Check if subscriber already exists
            if (response.status === 422 || data.message?.includes('already')) {
                return res.status(200).json({
                    success: true,
                    message: 'You\'re already subscribed to our email list!',
                    alreadySubscribed: true
                });
            }

            console.error('MailerLite API error:', data);
            throw new Error(data.message || 'Failed to subscribe');
        }

        console.log('✅ New subscriber added to MailerLite:', email);

        return res.status(200).json({
            success: true,
            message: 'Success! Check your email for your free starter kit.',
            data: {
                email: data.data?.email,
                subscriberId: data.data?.id
            }
        });

    } catch (error) {
        console.error('MailerLite subscription error:', error);
        return res.status(500).json({
            error: 'Failed to subscribe',
            message: error.message
        });
    }
}
