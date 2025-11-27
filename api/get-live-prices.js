/**
 * Domain Price API - Manually Verified Pricing
 *
 * Uses manually verified pricing from pricing-config.json
 * This ensures accuracy since provider websites use JavaScript-rendered prices
 * that can't be reliably scraped.
 *
 * To update prices: Edit pricing-config.json with current provider prices
 */

const fs = require('fs');
const path = require('path');

/**
 * Load pricing from config file
 */
function loadPricingConfig() {
    try {
        // In Vercel, read from the project root
        const configPath = path.join(process.cwd(), 'pricing-config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.error('Error loading pricing config:', error.message);
        // Return fallback pricing
        return getFallbackPricing();
    }
}

/**
 * Fallback pricing if config can't be loaded
 */
function getFallbackPricing() {
    return {
        "Bluehost": {
            ".com": { "firstYear": 0, "renewal": 24.19 },
            ".net": { "firstYear": 0, "renewal": 20.19 },
            ".org": { "firstYear": 0, "renewal": 19.19 },
            ".co": { "firstYear": 0, "renewal": 34.99 },
            ".io": { "firstYear": 0, "renewal": 64.99 },
            ".biz": { "firstYear": 0, "renewal": 24.99 },
            "url": "https://bluehost.sjv.io/DyaJob",
            "note": "Free* with hosting plan",
            "isFreeWithHosting": true,
            "priority": 0
        },
        "Hostinger": {
            ".com": { "firstYear": 0.99, "renewal": 13.99 },
            ".net": { "firstYear": 2.99, "renewal": 14.99 },
            ".org": { "firstYear": 4.99, "renewal": 15.99 },
            ".co": { "firstYear": 1.99, "renewal": 32.99 },
            ".io": { "firstYear": 39.99, "renewal": 59.99 },
            ".biz": { "firstYear": 4.99, "renewal": 17.99 },
            "url": "https://www.hostinger.com",
            "note": "First year promotional pricing"
        },
        "GoDaddy": {
            ".com": { "firstYear": 0.99, "renewal": 21.99 },
            ".net": { "firstYear": 1.99, "renewal": 21.99 },
            ".org": { "firstYear": 2.99, "renewal": 21.99 },
            ".co": { "firstYear": 6.99, "renewal": 36.99 },
            ".io": { "firstYear": 39.99, "renewal": 69.99 },
            ".biz": { "firstYear": 2.99, "renewal": 21.99 },
            "url": "https://www.godaddy.com",
            "note": "Popular choice"
        },
        "SiteGround": {
            ".com": { "firstYear": 15.95, "renewal": 19.95 },
            ".net": { "firstYear": 17.95, "renewal": 21.95 },
            ".org": { "firstYear": 17.95, "renewal": 21.95 },
            ".co": { "firstYear": 29.95, "renewal": 39.95 },
            ".io": { "firstYear": 59.95, "renewal": 79.95 },
            ".biz": { "firstYear": 17.95, "renewal": 21.95 },
            "url": "https://www.siteground.com",
            "note": "Consistent pricing"
        }
    };
}

/**
 * Main handler - Vercel/Netlify Serverless Function
 */
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        console.log('Loading prices from config...');

        // Load pricing from config file
        const pricing = loadPricingConfig();

        // Add timestamp
        const response = {
            ...pricing,
            cached: false,
            timestamp: Date.now(),
            source: 'manually-verified'
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error loading prices:', error);
        res.status(500).json({
            error: 'Failed to load prices',
            message: error.message
        });
    }
};
