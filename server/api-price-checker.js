/**
 * Real-Time Domain Price API Server - ResellerClub Integration
 *
 * This server queries ResellerClub API for real-time domain pricing.
 * ResellerClub provides a single API for multiple registrars and TLDs.
 *
 * Setup:
 * 1. Sign up at https://www.resellerclub.com/
 * 2. Get API credentials from your reseller dashboard
 * 3. Add credentials to .env file
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Cache prices for 6 hours to reduce API calls
const priceCache = new Map();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

/**
 * ResellerClub API Configuration
 * API Docs: https://manage.resellerclub.com/kb/answer/751
 */
const RESELLERCLUB_CONFIG = {
    baseUrl: 'https://httpapi.com/api',
    authId: process.env.RESELLERCLUB_AUTH_ID,
    apiKey: process.env.RESELLERCLUB_API_KEY
};

/**
 * Fetch domain pricing from ResellerClub
 */
async function getResellerClubPrice(extension) {
    try {
        // Remove leading dot from extension
        const tld = extension.replace('.', '');

        const response = await axios.get(`${RESELLERCLUB_CONFIG.baseUrl}/domains/customer-price.json`, {
            params: {
                'auth-userid': RESELLERCLUB_CONFIG.authId,
                'api-key': RESELLERCLUB_CONFIG.apiKey,
                'tlds': tld
            }
        });

        if (response.data && response.data[tld]) {
            const pricing = response.data[tld];
            return {
                firstYear: parseFloat(pricing.addnewdomain?.[1] || pricing.addnewdomain || 0),
                renewal: parseFloat(pricing.renewdomain?.[1] || pricing.renewdomain || 0),
                transfer: parseFloat(pricing.addtransferdomain?.[1] || pricing.addtransferdomain || 0)
            };
        }

        return null;
    } catch (error) {
        console.error(`ResellerClub API error for ${extension}:`, error.message);
        return null;
    }
}

/**
 * GoDaddy API Integration (optional - as alternative/fallback)
 */
async function getGoDaddyPrice(extension) {
    if (!process.env.GODADDY_API_KEY || !process.env.GODADDY_API_SECRET) {
        return null; // Skip if credentials not configured
    }

    try {
        const response = await axios.get(
            `https://api.godaddy.com/v1/domains/available`,
            {
                headers: {
                    'Authorization': `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    domain: `example${extension}`,
                    checkType: 'FAST'
                }
            }
        );

        if (response.data) {
            return {
                firstYear: response.data.price / 1000000,
                renewal: response.data.renewalPrice / 1000000
            };
        }

        return null;
    } catch (error) {
        console.error(`GoDaddy API error for ${extension}:`, error.message);
        return null;
    }
}

/**
 * API Endpoint: Get real-time prices for a domain extension
 */
app.get('/api/domain-prices/:extension', async (req, res) => {
    let { extension } = req.params;

    // Ensure extension starts with a dot
    if (!extension.startsWith('.')) {
        extension = `.${extension}`;
    }

    // Check cache first
    const cacheKey = `prices-${extension}`;
    const cached = priceCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`Cache hit for ${extension}`);
        return res.json(cached.data);
    }

    try {
        // Fetch from ResellerClub (primary source)
        const resellerClubPrice = await getResellerClubPrice(extension);

        // Optionally fetch GoDaddy as backup/comparison
        const godaddyPrice = await getGoDaddyPrice(extension);

        const prices = {
            ResellerClub: resellerClubPrice,
            GoDaddy: godaddyPrice,
            // Format for frontend compatibility
            primary: resellerClubPrice || godaddyPrice
        };

        // Cache the results
        priceCache.set(cacheKey, {
            data: prices,
            timestamp: Date.now()
        });

        console.log(`Fetched fresh prices for ${extension}`);
        res.json(prices);
    } catch (error) {
        console.error('Price fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

/**
 * API Endpoint: Get prices for multiple extensions at once
 */
app.post('/api/domain-prices/batch', async (req, res) => {
    const { extensions } = req.body;

    if (!Array.isArray(extensions)) {
        return res.status(400).json({ error: 'Extensions must be an array' });
    }

    try {
        const results = {};

        for (const ext of extensions) {
            const extension = ext.startsWith('.') ? ext : `.${ext}`;
            const cacheKey = `prices-${extension}`;
            const cached = priceCache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                results[extension] = cached.data;
            } else {
                const price = await getResellerClubPrice(extension);
                const data = { primary: price };

                priceCache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });

                results[extension] = data;
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Batch price fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch batch prices' });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        cacheSize: priceCache.size,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Price API server running on port ${PORT}`);
    console.log(`📦 Cache duration: ${CACHE_DURATION / 1000 / 60 / 60} hours`);
    console.log(`🔑 ResellerClub: ${RESELLERCLUB_CONFIG.authId ? 'Configured' : 'Not configured'}`);
    console.log(`🔑 GoDaddy: ${process.env.GODADDY_API_KEY ? 'Configured' : 'Not configured'}`);
});

module.exports = app;
