/**
 * Email Verification API
 * Verifies user email with token
 */

// Temporary storage (replace with real database)
const users = new Map();
const verificationTokens = new Map();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const token = req.method === 'POST' ? req.body.token : req.query.token;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }

        // Get token data
        const tokenData = verificationTokens.get(token);
        if (!tokenData) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        // Check if token expired
        if (Date.now() > tokenData.expiresAt) {
            verificationTokens.delete(token);
            return res.status(400).json({ error: 'Verification token has expired' });
        }

        // Get user
        const user = users.get(tokenData.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Mark user as verified
        user.verified = true;
        user.verifiedAt = new Date().toISOString();
        users.set(user.email, user);

        // Delete used token
        verificationTokens.delete(token);

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });

    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({
            error: 'Failed to verify email',
            message: error.message
        });
    }
}
