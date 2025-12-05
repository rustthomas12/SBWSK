/**
 * User Signup API
 * Creates new user account with email verification
 */

const { Resend } = require('resend');
const crypto = require('crypto');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

// In-memory user storage (for demo - use a real database in production)
// For Vercel, we'll use Vercel KV or you can integrate with your database
const users = new Map();
const verificationTokens = new Map();

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
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = hashPassword(password);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create user
        const user = {
            id: crypto.randomUUID(),
            email: email.toLowerCase(),
            passwordHash,
            name,
            verified: false,
            createdAt: new Date().toISOString()
        };

        // Save user and verification token
        await saveUser(user);
        await saveVerificationToken(verificationToken, user.email);

        // Send verification email
        const verificationUrl = `${process.env.VERCEL_URL || 'https://smallbusinesswebsitestarterkit.com'}/verify-email.html?token=${verificationToken}`;

        await resend.emails.send({
            from: 'SBWSK <noreply@smallbusinesswebsitestarterkit.com>',
            to: email,
            subject: 'Verify your email - SBWSK',
            html: `
                <h2>Welcome to Small Business Website Starter Kit!</h2>
                <p>Hi ${name},</p>
                <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
                <p><a href="${verificationUrl}" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a></p>
                <p>Or copy and paste this link into your browser:</p>
                <p>${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>SBWSK Team</p>
            `
        });

        // Notify admin
        await resend.emails.send({
            from: 'SBWSK <noreply@smallbusinesswebsitestarterkit.com>',
            to: 'tom@lowlightdigital.com',
            subject: 'New User Signup - SBWSK',
            html: `
                <h3>New User Registered</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            `
        });

        return res.status(201).json({
            success: true,
            message: 'Account created! Please check your email to verify your account.',
            userId: user.id
        });

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            error: 'Failed to create account',
            message: error.message
        });
    }
}

// Helper functions (simple in-memory storage - replace with real database)
async function getUserByEmail(email) {
    // TODO: Replace with real database query
    return users.get(email.toLowerCase());
}

async function saveUser(user) {
    // TODO: Replace with real database insert
    users.set(user.email, user);
}

async function saveVerificationToken(token, email) {
    // TODO: Replace with real database insert
    verificationTokens.set(token, {
        email,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
}

function hashPassword(password) {
    // Simple hash for demo - use bcrypt in production
    return crypto.createHash('sha256').update(password).digest('hex');
}
