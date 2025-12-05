/**
 * User Login API
 * Authenticates user and creates session
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Temporary in-memory storage (replace with real database)
const users = new Map();
const sessions = new Map();

export default async function handler(req, res) {
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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if email is verified
        if (!user.verified) {
            return res.status(403).json({ error: 'Please verify your email before logging in' });
        }

        // Verify password
        const passwordHash = hashPassword(password);
        if (passwordHash !== user.passwordHash) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create session token
        const sessionToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Save session
        await saveSession(sessionToken, user.id);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: sessionToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Failed to login',
            message: error.message
        });
    }
}

async function getUserByEmail(email) {
    return users.get(email.toLowerCase());
}

async function saveSession(token, userId) {
    sessions.set(token, {
        userId,
        createdAt: Date.now()
    });
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
