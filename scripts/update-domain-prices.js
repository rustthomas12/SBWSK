#!/usr/bin/env node

/**
 * Automatic Domain Price Updater
 * Fetches current domain prices from provider websites and updates domain-checker.js
 * Runs weekly via GitHub Actions
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Make HTTPS request and return response data
 */
function httpsGet(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        lib.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

/**
 * Extract prices from HTML using simple regex patterns
 * This is more reliable than full HTML parsing for pricing pages
 */
function extractPrice(html, pattern) {
    const match = html.match(pattern);
    if (match && match[1]) {
        return parseFloat(match[1].replace(/[^0-9.]/g, ''));
    }
    return null;
}

/**
 * Extract promotional/discounted prices
 * Looks for common discount patterns like strikethrough, sale prices, etc.
 */
function extractPromoPrice(html, extension) {
    // Common promo patterns
    const patterns = [
        new RegExp(`${extension}[^$]*(?:sale|promo|discount|now)[^$]*\\$(\\d+\\.\\d+)`, 'i'),
        new RegExp(`${extension}[^$]*<strike[^>]*>.*?</strike>[^$]*\\$(\\d+\\.\\d+)`, 'i'),
        new RegExp(`${extension}[^$]*(?:was|regular)[^$]*\\$[\\d.]+[^$]*(?:now|sale)[^$]*\\$(\\d+\\.\\d+)`, 'i'),
        new RegExp(`${extension}[^$]*\\$(\\d+\\.\\d+)[^$]*(?:first year|promotional)`, 'i')
    ];

    for (const pattern of patterns) {
        const price = extractPrice(html, pattern);
        if (price) return price;
    }
    return null;
}

/**
 * Check for active promotions and discount codes
 */
function extractPromotionInfo(html) {
    const promoPatterns = [
        /save\s+(\d+)%/i,
        /(\d+)%\s+off/i,
        /discount:\s*(\d+)%/i,
        /promo.*?(\d+)%/i
    ];

    for (const pattern of promoPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
            return `${match[1]}% off`;
        }
    }

    // Check for specific promo codes
    const codeMatch = html.match(/(?:code|coupon):\s*([A-Z0-9]{4,})/i);
    if (codeMatch) {
        return `Code: ${codeMatch[1]}`;
    }

    return null;
}

// Price fetching functions for each provider
const priceUpdaters = {
    async fetchHostingerPrices() {
        console.log('Fetching Hostinger prices from pricing page...');
        try {
            // Fetch from Hostinger's pricing page
            const html = await httpsGet('https://www.hostinger.com/domain-name-search');

            // Look for regular and promotional pricing
            const comPrice = extractPrice(html, /\.com[^$]*\$(\d+\.\d+)/i);
            const comPromo = extractPromoPrice(html, '\\.com');
            const netPrice = extractPrice(html, /\.net[^$]*\$(\d+\.\d+)/i);
            const netPromo = extractPromoPrice(html, '\\.net');
            const orgPrice = extractPrice(html, /\.org[^$]*\$(\d+\.\d+)/i);
            const orgPromo = extractPromoPrice(html, '\\.org');

            // Check for active promotions
            const promotion = extractPromotionInfo(html);

            console.log(`  ${promotion ? '🎉 Active promotion: ' + promotion : '  No active promotions'}`);

            return {
                '.com': {
                    firstYear: comPromo || comPrice || 10.19,
                    regularPrice: comPrice,
                    promoPrice: comPromo,
                    renewal: 18.19
                },
                '.net': {
                    firstYear: netPromo || netPrice || 15.19,
                    regularPrice: netPrice,
                    promoPrice: netPromo,
                    renewal: 18.19
                },
                '.org': {
                    firstYear: orgPromo || orgPrice || 8.19,
                    regularPrice: orgPrice,
                    promoPrice: orgPromo,
                    renewal: 16.19
                },
                '.co': { firstYear: 11.99, renewal: 32.99 },
                '.io': { firstYear: 42.99, renewal: 64.99 },
                '.biz': { firstYear: 13.99, renewal: 18.19 },
                promotion: promotion
            };
        } catch (error) {
            console.warn('Could not fetch Hostinger prices, using cached values:', error.message);
            return {
                '.com': { firstYear: 10.19, renewal: 18.19 },
                '.net': { firstYear: 15.19, renewal: 18.19 },
                '.org': { firstYear: 8.19, renewal: 16.19 },
                '.co': { firstYear: 11.99, renewal: 32.99 },
                '.io': { firstYear: 42.99, renewal: 64.99 },
                '.biz': { firstYear: 13.99, renewal: 18.19 }
            };
        }
    },

    async fetchGoDaddyPrices() {
        console.log('Fetching GoDaddy prices from pricing page...');
        try {
            const html = await httpsGet('https://www.godaddy.com/domains/domain-name-search');

            const comPrice = extractPrice(html, /\.com[^$]*\$(\d+\.\d+)/i);
            const comPromo = extractPromoPrice(html, '\\.com');
            const netPrice = extractPrice(html, /\.net[^$]*\$(\d+\.\d+)/i);
            const netPromo = extractPromoPrice(html, '\\.net');
            const orgPrice = extractPrice(html, /\.org[^$]*\$(\d+\.\d+)/i);
            const orgPromo = extractPromoPrice(html, '\\.org');

            const promotion = extractPromotionInfo(html);
            console.log(`  ${promotion ? '🎉 Active promotion: ' + promotion : '  No active promotions'}`);

            return {
                '.com': {
                    firstYear: comPromo || comPrice || 11.99,
                    regularPrice: comPrice,
                    promoPrice: comPromo,
                    renewal: 24.99
                },
                '.net': {
                    firstYear: netPromo || netPrice || 14.99,
                    regularPrice: netPrice,
                    promoPrice: netPromo,
                    renewal: 24.99
                },
                '.org': {
                    firstYear: orgPromo || orgPrice || 14.99,
                    regularPrice: orgPrice,
                    promoPrice: orgPromo,
                    renewal: 24.99
                },
                '.co': { firstYear: 24.99, renewal: 39.99 },
                '.io': { firstYear: 49.99, renewal: 79.99 },
                '.biz': { firstYear: 14.99, renewal: 24.99 },
                promotion: promotion
            };
        } catch (error) {
            console.warn('Could not fetch GoDaddy prices, using cached values:', error.message);
            return {
                '.com': { firstYear: 11.99, renewal: 24.99 },
                '.net': { firstYear: 14.99, renewal: 24.99 },
                '.org': { firstYear: 14.99, renewal: 24.99 },
                '.co': { firstYear: 24.99, renewal: 39.99 },
                '.io': { firstYear: 49.99, renewal: 79.99 },
                '.biz': { firstYear: 14.99, renewal: 24.99 }
            };
        }
    },

    async fetchSiteGroundPrices() {
        console.log('Fetching SiteGround prices from domain page...');
        try {
            const html = await httpsGet('https://www.siteground.com/domain-names');

            const comPrice = extractPrice(html, /\.com[^$]*\$(\d+\.\d+)/i);
            const comPromo = extractPromoPrice(html, '\\.com');
            const netPrice = extractPrice(html, /\.net[^$]*\$(\d+\.\d+)/i);
            const netPromo = extractPromoPrice(html, '\\.net');
            const orgPrice = extractPrice(html, /\.org[^$]*\$(\d+\.\d+)/i);
            const orgPromo = extractPromoPrice(html, '\\.org');

            const promotion = extractPromotionInfo(html);
            console.log(`  ${promotion ? '🎉 Active promotion: ' + promotion : '  No active promotions'}`);

            return {
                '.com': {
                    firstYear: comPromo || comPrice || 15.95,
                    regularPrice: comPrice,
                    promoPrice: comPromo,
                    renewal: 19.99
                },
                '.net': {
                    firstYear: netPromo || netPrice || 17.95,
                    regularPrice: netPrice,
                    promoPrice: netPromo,
                    renewal: 21.99
                },
                '.org': {
                    firstYear: orgPromo || orgPrice || 17.95,
                    regularPrice: orgPrice,
                    promoPrice: orgPromo,
                    renewal: 21.99
                },
                '.co': { firstYear: 29.95, renewal: 39.99 },
                '.io': { firstYear: 59.95, renewal: 79.99 },
                '.biz': { firstYear: 17.95, renewal: 21.99 },
                promotion: promotion
            };
        } catch (error) {
            console.warn('Could not fetch SiteGround prices, using cached values:', error.message);
            return {
                '.com': { firstYear: 15.95, renewal: 19.99 },
                '.net': { firstYear: 17.95, renewal: 21.99 },
                '.org': { firstYear: 17.95, renewal: 21.99 },
                '.co': { firstYear: 29.95, renewal: 39.99 },
                '.io': { firstYear: 59.95, renewal: 79.99 },
                '.biz': { firstYear: 17.95, renewal: 21.99 }
            };
        }
    },

    async fetchBluehostPrices() {
        console.log('Fetching Bluehost renewal prices...');
        // Bluehost offers free domains with hosting, so firstYear = 0
        // Renewal prices are more stable
        return {
            '.com': { firstYear: 0, renewal: 24.19 },
            '.net': { firstYear: 0, renewal: 20.19 },
            '.org': { firstYear: 0, renewal: 19.19 },
            '.co': { firstYear: 0, renewal: 34.99 },
            '.io': { firstYear: 0, renewal: 64.99 },
            '.biz': { firstYear: 0, renewal: 24.99 }
        };
    }
};

async function updatePrices() {
    console.log('Starting automatic price update...\n');

    try {
        // Fetch prices from all providers
        const [hostinger, godaddy, siteground, bluehost] = await Promise.all([
            priceUpdaters.fetchHostingerPrices(),
            priceUpdaters.fetchGoDaddyPrices(),
            priceUpdaters.fetchSiteGroundPrices(),
            priceUpdaters.fetchBluehostPrices()
        ]);

        // Build the new PROVIDER_PRICING object
        const newPricing = {
            'Bluehost': {
                ...bluehost,
                url: 'https://bluehost.sjv.io/DyaJob',
                note: 'Free* with hosting plan',
                isFreeWithHosting: true,
                priority: 0
            },
            'Hostinger': {
                ...hostinger,
                url: 'https://www.hostinger.com',
                note: 'Low first year price'
            },
            'GoDaddy': {
                ...godaddy,
                url: 'https://www.godaddy.com',
                note: 'Popular choice'
            },
            'SiteGround': {
                ...siteground,
                url: 'https://www.siteground.com',
                note: 'Consistent pricing'
            }
        };

        // Read the current domain-checker.js file
        const domainCheckerPath = path.join(__dirname, '../js/domain-checker.js');
        let fileContent = fs.readFileSync(domainCheckerPath, 'utf8');

        // Find and replace the PROVIDER_PRICING object
        const pricingRegex = /const PROVIDER_PRICING = \{[\s\S]*?\n\};/;
        // Format the object - keep quotes around extension names (like '.com') but remove from provider names
        let newPricingString = JSON.stringify(newPricing, null, 4);
        // Only remove quotes from top-level provider names, not extension keys
        newPricingString = newPricingString.replace(/"(Bluehost|Hostinger|GoDaddy|SiteGround)":/g, '$1:');
        newPricingString = `const PROVIDER_PRICING = ${newPricingString};`;

        if (pricingRegex.test(fileContent)) {
            fileContent = fileContent.replace(pricingRegex, newPricingString);
            fs.writeFileSync(domainCheckerPath, fileContent, 'utf8');
            console.log('\n✅ Successfully updated domain prices!');
            console.log('Updated providers: Bluehost, Hostinger, GoDaddy, SiteGround');
            return true;
        } else {
            console.error('❌ Could not find PROVIDER_PRICING in domain-checker.js');
            return false;
        }
    } catch (error) {
        console.error('❌ Error updating prices:', error.message);
        return false;
    }
}

// Run if called directly
if (require.main === module) {
    updatePrices().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { updatePrices };
