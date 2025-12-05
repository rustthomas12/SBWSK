/**
 * Pinterest Conversion API - Server-side tracking
 * Sends conversion events to Pinterest for better attribution
 */

const PINTEREST_API_TOKEN = process.env.PINTEREST_API_TOKEN;
const PINTEREST_AD_ACCOUNT_ID = process.env.PINTEREST_AD_ACCOUNT_ID || '549765154117';
const PINTEREST_TAG_ID = '2612806189856';

export default async function handler(req, res) {
    // Set CORS headers
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
        const {
            event_name,        // 'checkout', 'lead', 'page_visit', 'custom'
            event_id,          // Unique event ID to prevent duplicates
            user_data,         // User information (email, client_user_agent, etc.)
            custom_data        // Event-specific data (value, currency, etc.)
        } = req.body;

        // Validate required fields
        if (!event_name || !event_id) {
            return res.status(400).json({ error: 'Missing required fields: event_name, event_id' });
        }

        // Create event data structure for Pinterest API
        const eventData = {
            event_name: event_name,
            action_source: 'web',
            event_time: Math.floor(Date.now() / 1000),
            event_id: event_id,
            event_source_url: user_data?.event_source_url || req.headers.referer || 'https://smallbusinesswebsitestarterkit.com',
            user_data: {
                client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                client_user_agent: user_data?.client_user_agent || req.headers['user-agent'],
                ...(user_data?.em && { em: [hashEmail(user_data.em)] }), // Hashed email if provided
                ...(user_data?.ph && { ph: [hashPhone(user_data.ph)] })  // Hashed phone if provided
            }
        };

        // Add custom data if provided
        if (custom_data) {
            eventData.custom_data = {
                ...custom_data,
                currency: custom_data.currency || 'USD'
            };
        }

        // Send to Pinterest Conversion API
        const response = await fetch(`https://api.pinterest.com/v5/ad_accounts/${PINTEREST_AD_ACCOUNT_ID}/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PINTEREST_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: [eventData]
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Pinterest API error:', result);
            throw new Error(`Pinterest API returned ${response.status}`);
        }

        console.log('Pinterest conversion tracked:', event_name, event_id);

        return res.status(200).json({
            success: true,
            message: 'Conversion tracked',
            pinterest_response: result
        });

    } catch (error) {
        console.error('Error tracking Pinterest conversion:', error);
        return res.status(500).json({
            error: 'Failed to track conversion',
            message: error.message
        });
    }
}

/**
 * Hash email using SHA256 (Pinterest requires hashed PII)
 */
function hashEmail(email) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/**
 * Hash phone number using SHA256
 */
function hashPhone(phone) {
    const crypto = require('crypto');
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    return crypto.createHash('sha256').update(cleaned).digest('hex');
}
