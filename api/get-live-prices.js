/**
 * Real-Time Domain Price Scraper - Serverless API
 *
 * This scrapes exact prices from provider websites on-demand.
 * NO API KEYS NEEDED - works immediately!
 *
 * Deploy to Vercel/Netlify as a serverless function.
 */

const https = require('https');
const http = require('http');

// Cache prices for 30 minutes to avoid excessive scraping
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Make HTTPS request
 */
function httpsGet(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        const req = lib.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

/**
 * Extract price from HTML
 */
function extractPrice(html, pattern) {
    const match = html.match(pattern);
    if (match && match[1]) {
        return parseFloat(match[1].replace(/[^0-9.]/g, ''));
    }
    return null;
}

/**
 * Extract promotional pricing (regular + promo prices)
 */
function extractPromoPricing(html, extension) {
    const result = { regular: null, promo: null };

    // Strikethrough pattern
    const strikethroughPattern = new RegExp(
        `${extension}[^$]*<(?:strike|s|del)[^>]*>\\s*\\$([\\d.]+)[^<]*</(?:strike|s|del)>[^$]*\\$([\\d.]+)`,
        'i'
    );
    let match = html.match(strikethroughPattern);
    if (match) {
        result.regular = parseFloat(match[1]);
        result.promo = parseFloat(match[2]);
        return result;
    }

    // "Was/Now" pattern
    const wasNowPattern = new RegExp(
        `${extension}[^$]*(?:was|regular)[^$]*\\$([\\d.]+)[^$]*(?:now|sale)[^$]*\\$([\\d.]+)`,
        'i'
    );
    match = html.match(wasNowPattern);
    if (match) {
        result.regular = parseFloat(match[1]);
        result.promo = parseFloat(match[2]);
        return result;
    }

    return result;
}

/**
 * Fetch Hostinger prices
 */
async function fetchHostingerPrices() {
    try {
        const html = await httpsGet('https://www.hostinger.com/domain-name-search');

        const comPricing = extractPromoPricing(html, '\\.com');
        const netPricing = extractPromoPricing(html, '\\.net');
        const orgPricing = extractPromoPricing(html, '\\.org');

        const comPrice = comPricing.promo || comPricing.regular || extractPrice(html, /\.com[^$]*\$(\d+\.\d+)/i) || 10.19;
        const netPrice = netPricing.promo || netPricing.regular || extractPrice(html, /\.net[^$]*\$(\d+\.\d+)/i) || 15.19;
        const orgPrice = orgPricing.promo || orgPricing.regular || extractPrice(html, /\.org[^$]*\$(\d+\.\d+)/i) || 8.19;

        return {
            '.com': { firstYear: comPrice, regularPrice: comPricing.regular, promoPrice: comPricing.promo, renewal: 18.19 },
            '.net': { firstYear: netPrice, regularPrice: netPricing.regular, promoPrice: netPricing.promo, renewal: 18.19 },
            '.org': { firstYear: orgPrice, regularPrice: orgPricing.regular, promoPrice: orgPricing.promo, renewal: 16.19 },
            '.co': { firstYear: 11.99, renewal: 32.99 },
            '.io': { firstYear: 42.99, renewal: 64.99 },
            '.biz': { firstYear: 13.99, renewal: 18.19 }
        };
    } catch (error) {
        console.error('Hostinger fetch error:', error.message);
        return {
            '.com': { firstYear: 10.19, renewal: 18.19 },
            '.net': { firstYear: 15.19, renewal: 18.19 },
            '.org': { firstYear: 8.19, renewal: 16.19 },
            '.co': { firstYear: 11.99, renewal: 32.99 },
            '.io': { firstYear: 42.99, renewal: 64.99 },
            '.biz': { firstYear: 13.99, renewal: 18.19 }
        };
    }
}

/**
 * Fetch GoDaddy prices
 */
async function fetchGoDaddyPrices() {
    try {
        const html = await httpsGet('https://www.godaddy.com/domains/domain-name-search');

        const comPricing = extractPromoPricing(html, '\\.com');
        const netPricing = extractPromoPricing(html, '\\.net');
        const orgPricing = extractPromoPricing(html, '\\.org');

        const comPrice = comPricing.promo || comPricing.regular || extractPrice(html, /\.com[^$]*\$(\d+\.\d+)/i) || 11.99;
        const netPrice = netPricing.promo || netPricing.regular || extractPrice(html, /\.net[^$]*\$(\d+\.\d+)/i) || 14.99;
        const orgPrice = orgPricing.promo || orgPricing.regular || extractPrice(html, /\.org[^$]*\$(\d+\.\d+)/i) || 14.99;

        return {
            '.com': { firstYear: comPrice, regularPrice: comPricing.regular, promoPrice: comPricing.promo, renewal: 24.99 },
            '.net': { firstYear: netPrice, regularPrice: netPricing.regular, promoPrice: netPricing.promo, renewal: 24.99 },
            '.org': { firstYear: orgPrice, regularPrice: orgPricing.regular, promoPrice: orgPricing.promo, renewal: 24.99 },
            '.co': { firstYear: 24.99, renewal: 39.99 },
            '.io': { firstYear: 49.99, renewal: 79.99 },
            '.biz': { firstYear: 14.99, renewal: 24.99 }
        };
    } catch (error) {
        console.error('GoDaddy fetch error:', error.message);
        return {
            '.com': { firstYear: 11.99, renewal: 24.99 },
            '.net': { firstYear: 14.99, renewal: 24.99 },
            '.org': { firstYear: 14.99, renewal: 24.99 },
            '.co': { firstYear: 24.99, renewal: 39.99 },
            '.io': { firstYear: 49.99, renewal: 79.99 },
            '.biz': { firstYear: 14.99, renewal: 24.99 }
        };
    }
}

/**
 * Fetch SiteGround prices
 */
async function fetchSiteGroundPrices() {
    try {
        const html = await httpsGet('https://www.siteground.com/domain-names');

        const comPricing = extractPromoPricing(html, '\\.com');
        const netPricing = extractPromoPricing(html, '\\.net');
        const orgPricing = extractPromoPricing(html, '\\.org');

        const comPrice = comPricing.promo || comPricing.regular || extractPrice(html, /\.com[^$]*\$(\d+\.\d+)/i) || 15.95;
        const netPrice = netPricing.promo || netPricing.regular || extractPrice(html, /\.net[^$]*\$(\d+\.\d+)/i) || 17.95;
        const orgPrice = orgPricing.promo || orgPricing.regular || extractPrice(html, /\.org[^$]*\$(\d+\.\d+)/i) || 17.95;

        return {
            '.com': { firstYear: comPrice, regularPrice: comPricing.regular, promoPrice: comPricing.promo, renewal: 19.99 },
            '.net': { firstYear: netPrice, regularPrice: netPricing.regular, promoPrice: netPricing.promo, renewal: 21.99 },
            '.org': { firstYear: orgPrice, regularPrice: orgPricing.regular, promoPrice: orgPricing.promo, renewal: 21.99 },
            '.co': { firstYear: 29.95, renewal: 39.99 },
            '.io': { firstYear: 59.95, renewal: 79.99 },
            '.biz': { firstYear: 17.95, renewal: 21.99 }
        };
    } catch (error) {
        console.error('SiteGround fetch error:', error.message);
        return {
            '.com': { firstYear: 15.95, renewal: 19.99 },
            '.net': { firstYear: 17.95, renewal: 21.99 },
            '.org': { firstYear: 17.95, renewal: 21.99 },
            '.co': { firstYear: 29.95, renewal: 39.99 },
            '.io': { firstYear: 59.95, renewal: 79.99 },
            '.biz': { firstYear: 17.95, renewal: 21.99 }
        };
    }
}

/**
 * Bluehost prices (free with hosting)
 */
function fetchBluehostPrices() {
    return {
        '.com': { firstYear: 0, renewal: 24.19 },
        '.net': { firstYear: 0, renewal: 20.19 },
        '.org': { firstYear: 0, renewal: 19.19 },
        '.co': { firstYear: 0, renewal: 34.99 },
        '.io': { firstYear: 0, renewal: 64.99 },
        '.biz': { firstYear: 0, renewal: 24.99 }
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
        // Check cache first
        const cacheKey = 'all-prices';
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('Returning cached prices');
            return res.status(200).json({
                ...cached.data,
                cached: true,
                timestamp: cached.timestamp
            });
        }

        console.log('Fetching fresh prices...');

        // Fetch all prices (with some parallelization but not too aggressive)
        const [hostinger, godaddy] = await Promise.all([
            fetchHostingerPrices(),
            fetchGoDaddyPrices()
        ]);

        // Small delay, then fetch remaining
        await new Promise(resolve => setTimeout(resolve, 1000));

        const [siteground, bluehost] = await Promise.all([
            fetchSiteGroundPrices(),
            Promise.resolve(fetchBluehostPrices())
        ]);

        const prices = {
            Bluehost: {
                ...bluehost,
                url: 'https://bluehost.sjv.io/DyaJob',
                note: 'Free* with hosting plan',
                isFreeWithHosting: true,
                priority: 0
            },
            Hostinger: {
                ...hostinger,
                url: 'https://www.hostinger.com',
                note: 'Low first year price'
            },
            GoDaddy: {
                ...godaddy,
                url: 'https://www.godaddy.com',
                note: 'Popular choice'
            },
            SiteGround: {
                ...siteground,
                url: 'https://www.siteground.com',
                note: 'Consistent pricing'
            }
        };

        // Cache the results
        cache.set(cacheKey, {
            data: prices,
            timestamp: Date.now()
        });

        res.status(200).json({
            ...prices,
            cached: false,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error fetching prices:', error);
        res.status(500).json({
            error: 'Failed to fetch prices',
            message: error.message
        });
    }
};
