/**
 * Domain Pricing Estimation API
 *
 * IMPORTANT: All prices returned are ESTIMATES ONLY
 * Actual prices may vary based on promotions, location, and other factors.
 * Users must verify exact pricing at each registrar before purchasing.
 *
 * Pricing Sources:
 * - GoDaddy: Official API (requires free API keys) - Estimated from API
 * - Namecheap: Official API (requires 20+ domains OR $50 balance) - Estimated from API
 * - Others: Manually verified standard pricing (updated regularly) - Estimated
 *
 * All prices include:
 * - First year registration estimates
 * - Promotional pricing estimates (when available)
 * - Renewal price estimates
 * - Last verification dates
 */

const https = require('https');

// Cache for 30 minutes
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000;

// Fallback prices with last verification dates
// UPDATE THESE PERIODICALLY by checking registrar websites
const FALLBACK_PRICES = {
    lastUpdated: '2025-11-27', // Update this when you verify prices
    prices: {
        '.com': {
            GoDaddy: 11.99,
            Namecheap: 13.98,
            Hostinger: { regular: 9.99, promo: 0.99, promoNote: '90% off first year' },
            Bluehost: { first: 0, renewal: 24.19, note: 'FREE with hosting' },
            SiteGround: 15.95
        },
        '.net': {
            GoDaddy: 14.99,
            Namecheap: 14.98,
            Hostinger: 12.99,
            Bluehost: { first: 0, renewal: 20.19, note: 'FREE with hosting' },
            SiteGround: 17.95
        },
        '.org': {
            GoDaddy: 14.99,
            Namecheap: 14.98,
            Hostinger: 12.99,
            Bluehost: { first: 0, renewal: 19.19, note: 'FREE with hosting' },
            SiteGround: 17.95
        },
        '.co': {
            GoDaddy: 24.99,
            Namecheap: 12.98,
            Hostinger: 11.99,
            Bluehost: { first: 0, renewal: 34.99, note: 'FREE with hosting' },
            SiteGround: 29.95
        },
        '.io': {
            GoDaddy: 49.99,
            Namecheap: 39.88,
            Hostinger: 39.99,
            Bluehost: { first: 0, renewal: 64.99, note: 'FREE with hosting' },
            SiteGround: 59.95
        },
        '.biz': {
            GoDaddy: 14.99,
            Namecheap: 17.98,
            Hostinger: 14.99,
            Bluehost: { first: 0, renewal: 24.99, note: 'FREE with hosting' },
            SiteGround: 17.95
        }
    }
};

/**
 * Make HTTPS request
 */
function httpsRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        if (postData) req.write(postData);
        req.end();
    });
}

/**
 * GoDaddy Official API
 * Docs: https://developer.godaddy.com/doc/endpoint/domains
 *
 * To get API keys:
 * 1. Go to https://developer.godaddy.com/keys
 * 2. Create production keys (free)
 * 3. Add to environment: GODADDY_API_KEY and GODADDY_API_SECRET
 */
async function getGoDaddyPrice(tld, apiKey = null, apiSecret = null) {
    try {
        const key = apiKey || process.env.GODADDY_API_KEY;
        const secret = apiSecret || process.env.GODADDY_API_SECRET;

        if (!key || !secret) {
            console.log('GoDaddy API keys not configured, using fallback pricing');
            return getFallbackGoDaddyPrice(tld);
        }

        const domain = `example${tld}`;
        const options = {
            hostname: 'api.godaddy.com',
            path: `/v1/domains/available?domain=${domain}&checkType=FULL&forTransfer=false`,
            method: 'GET',
            headers: {
                'Authorization': `sso-key ${key}:${secret}`,
                'Accept': 'application/json'
            }
        };

        const response = await httpsRequest(options);

        if (response && response.price !== undefined) {
            return {
                provider: 'GoDaddy',
                tld: tld,
                available: response.available,
                price: response.price / 1000000, // Micro-units to dollars
                currency: response.currency || 'USD',
                period: response.period || 1,
                definitive: response.definitive || false,
                source: 'official-api',
                timestamp: Date.now()
            };
        }

        return getFallbackGoDaddyPrice(tld);

    } catch (error) {
        console.error('GoDaddy API error:', error.message);
        return getFallbackGoDaddyPrice(tld);
    }
}

function getFallbackGoDaddyPrice(tld) {
    const tldPrices = FALLBACK_PRICES.prices[tld];
    const price = tldPrices?.GoDaddy || 19.99;

    return {
        provider: 'GoDaddy',
        tld: tld,
        price: price,
        currency: 'USD',
        source: 'fallback',
        note: 'Estimated price - Verify at godaddy.com',
        lastVerified: FALLBACK_PRICES.lastUpdated,
        timestamp: Date.now()
    };
}

/**
 * Namecheap API
 * Docs: https://www.namecheap.com/support/api/intro/
 *
 * To get API access:
 * 1. Have Namecheap account with $50+ balance OR 20+ domains
 * 2. Enable API: Account → Profile → API Access
 * 3. Whitelist your server IP
 * 4. Add to environment: NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_CLIENT_IP
 */
async function getNamecheapPrice(tld, apiUser = null, apiKey = null) {
    try {
        const user = apiUser || process.env.NAMECHEAP_API_USER;
        const key = apiKey || process.env.NAMECHEAP_API_KEY;
        const clientIp = process.env.NAMECHEAP_CLIENT_IP || '127.0.0.1';

        if (!user || !key) {
            console.log('Namecheap API not configured, using fallback');
            return getFallbackNamecheapPrice(tld);
        }

        // Build Namecheap API URL
        const domain = `example${tld}`;
        const apiUrl = `https://api.namecheap.com/xml.response`;
        const params = new URLSearchParams({
            ApiUser: user,
            ApiKey: key,
            UserName: user,
            Command: 'namecheap.users.getPricing',
            ClientIp: clientIp,
            ProductType: 'DOMAIN',
            ProductCategory: 'REGISTER',
            ActionName: 'REGISTER'
        });

        const options = {
            hostname: 'api.namecheap.com',
            path: `/xml.response?${params.toString()}`,
            method: 'GET',
            headers: {
                'Accept': 'application/xml'
            }
        };

        const response = await httpsRequest(options);

        // Note: Namecheap returns XML, would need XML parser here
        // For now, return fallback until full implementation
        console.log('Namecheap API response received, but XML parsing not implemented');
        return getFallbackNamecheapPrice(tld);

    } catch (error) {
        console.error('Namecheap API error:', error.message);
        return getFallbackNamecheapPrice(tld);
    }
}

function getFallbackNamecheapPrice(tld) {
    const tldPrices = FALLBACK_PRICES.prices[tld];
    const price = tldPrices?.Namecheap || 19.99;

    return {
        provider: 'Namecheap',
        tld: tld,
        price: price,
        currency: 'USD',
        source: 'fallback',
        note: 'Estimated price - Verify at namecheap.com',
        lastVerified: FALLBACK_PRICES.lastUpdated,
        timestamp: Date.now()
    };
}

/**
 * Hostinger Pricing
 * Note: Hostinger doesn't have a public API
 */
function getHostingerPrice(tld) {
    const tldData = FALLBACK_PRICES.prices[tld];
    const hostingerData = tldData?.Hostinger;

    if (!hostingerData) {
        return {
            provider: 'Hostinger',
            tld: tld,
            price: 19.99,
            currency: 'USD',
            source: 'fallback',
            note: 'Estimated price - Verify at hostinger.com',
            lastVerified: FALLBACK_PRICES.lastUpdated,
            timestamp: Date.now()
        };
    }

    // Handle promotional pricing structure
    if (typeof hostingerData === 'object' && hostingerData.promo) {
        return {
            provider: 'Hostinger',
            tld: tld,
            price: hostingerData.promo,
            regularPrice: hostingerData.regular,
            discount: hostingerData.promoNote || null,
            currency: 'USD',
            source: 'verified-standard',
            note: 'Estimated promo - Verify at hostinger.com',
            lastVerified: FALLBACK_PRICES.lastUpdated,
            timestamp: Date.now()
        };
    }

    // Standard pricing
    return {
        provider: 'Hostinger',
        tld: tld,
        price: typeof hostingerData === 'number' ? hostingerData : hostingerData.regular || 19.99,
        currency: 'USD',
        source: 'verified-standard',
        note: 'Estimated price - Verify at hostinger.com',
        lastVerified: FALLBACK_PRICES.lastUpdated,
        timestamp: Date.now()
    };
}

/**
 * Bluehost Pricing
 * Free with hosting plans (affiliate partner)
 */
function getBluehostPrice(tld) {
    const tldData = FALLBACK_PRICES.prices[tld];
    const bluehostData = tldData?.Bluehost;

    const renewalPrice = typeof bluehostData === 'object' ? bluehostData.renewal : 24.99;
    const note = typeof bluehostData === 'object' ? bluehostData.note : 'FREE with hosting plan purchase';

    return {
        provider: 'Bluehost',
        tld: tld,
        price: 0,
        renewalPrice: renewalPrice,
        currency: 'USD',
        source: 'verified-standard',
        note: note + ' (estimated)',
        requiresHosting: true,
        hostingUrl: 'https://bluehost.sjv.io/Webstarterkit',
        lastVerified: FALLBACK_PRICES.lastUpdated,
        timestamp: Date.now()
    };
}

/**
 * SiteGround Pricing
 * Note: SiteGround doesn't have a public API
 */
function getSiteGroundPrice(tld) {
    const tldData = FALLBACK_PRICES.prices[tld];
    const price = tldData?.SiteGround || 19.95;

    return {
        provider: 'SiteGround',
        tld: tld,
        price: price,
        currency: 'USD',
        source: 'verified-standard',
        note: 'Estimated price - Verify at siteground.com',
        lastVerified: FALLBACK_PRICES.lastUpdated,
        timestamp: Date.now()
    };
}

/**
 * Get comprehensive pricing from all providers with metadata
 */
async function getAllPricesForTLD(tld) {
    const extension = tld.startsWith('.') ? tld : `.${tld}`;

    // Check cache
    const cacheKey = `pricing-${extension}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        const cacheAgeMinutes = Math.round((Date.now() - cached.timestamp) / 1000 / 60);
        return {
            ...cached.data,
            cached: true,
            cacheAge: cacheAgeMinutes,
            cacheAgeDisplay: cacheAgeMinutes === 0 ? 'just now' : `${cacheAgeMinutes} min ago`
        };
    }

    try {
        // Fetch from all providers in parallel
        const [godaddy, namecheap, hostinger, bluehost, siteground] = await Promise.all([
            getGoDaddyPrice(extension),
            getNamecheapPrice(extension),
            Promise.resolve(getHostingerPrice(extension)),
            Promise.resolve(getBluehostPrice(extension)),
            Promise.resolve(getSiteGroundPrice(extension))
        ]);

        // Count API sources vs fallback
        const providerResults = [godaddy, namecheap, hostinger, bluehost, siteground];
        const apiSources = providerResults.filter(p => p.source === 'official-api').length;
        const fallbackSources = providerResults.filter(p => p.source === 'fallback' || p.source === 'verified-standard').length;

        // Find lowest price (excluding free with hosting)
        const paidPrices = [godaddy, namecheap, hostinger, siteground]
            .filter(p => p.price > 0)
            .map(p => p.price);

        const lowestPrice = paidPrices.length > 0 ? Math.min(...paidPrices) : 0;

        const pricing = {
            tld: extension,
            providers: {
                GoDaddy: godaddy,
                Namecheap: namecheap,
                Hostinger: hostinger,
                Bluehost: bluehost,
                SiteGround: siteground
            },
            lowestPrice: lowestPrice,
            bestDeal: findBestDeal([godaddy, namecheap, hostinger, siteground]),
            metadata: {
                apiSources: apiSources,
                fallbackSources: fallbackSources,
                fallbackLastUpdated: FALLBACK_PRICES.lastUpdated,
                totalProviders: providerResults.length,
                accuracy: apiSources > 0 ? 'Estimated from API data' : 'Estimated standard pricing'
            },
            timestamp: Date.now(),
            cached: false
        };

        // Cache results
        cache.set(cacheKey, {
            data: pricing,
            timestamp: Date.now()
        });

        return pricing;

    } catch (error) {
        console.error('Pricing fetch error:', error);
        throw error;
    }
}

/**
 * Find the best deal considering price and value
 */
function findBestDeal(providers) {
    const paidProviders = providers.filter(p => p.price > 0);

    if (paidProviders.length === 0) return null;

    // Sort by price
    paidProviders.sort((a, b) => a.price - b.price);

    const best = paidProviders[0];

    return {
        provider: best.provider,
        price: best.price,
        savings: best.regularPrice ? (best.regularPrice - best.price) : 0,
        discount: best.discount || null
    };
}

/**
 * Serverless function handler
 */
module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { tld, domain } = req.query;

        if (!tld && !domain) {
            return res.status(400).json({
                error: 'Please provide tld parameter (e.g., ?tld=.com)'
            });
        }

        // Extract TLD from domain if full domain provided
        const extension = domain
            ? '.' + domain.split('.').pop()
            : tld;

        const pricing = await getAllPricesForTLD(extension);

        res.status(200).json(pricing);

    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({
            error: 'Failed to fetch pricing',
            message: error.message
        });
    }
};
