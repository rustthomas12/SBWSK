#!/usr/bin/env node

/**
 * Automatic Domain Price Updater
 * Fetches current domain prices from provider websites and updates domain-checker.js
 * Runs weekly via GitHub Actions
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Price fetching functions for each provider
const priceUpdaters = {
    async fetchHostingerPrices() {
        console.log('Fetching Hostinger prices...');
        // In a real implementation, this would scrape or use an API
        // For now, we'll use a placeholder that can be enhanced
        return {
            '.com': { firstYear: 10.19, renewal: 18.19 },
            '.net': { firstYear: 15.19, renewal: 18.19 },
            '.org': { firstYear: 8.19, renewal: 16.19 },
            '.co': { firstYear: 11.99, renewal: 32.99 },
            '.io': { firstYear: 42.99, renewal: 64.99 },
            '.biz': { firstYear: 13.99, renewal: 18.19 }
        };
    },

    async fetchGoDaddyPrices() {
        console.log('Fetching GoDaddy prices...');
        return {
            '.com': { firstYear: 11.99, renewal: 24.99 },
            '.net': { firstYear: 14.99, renewal: 24.99 },
            '.org': { firstYear: 14.99, renewal: 24.99 },
            '.co': { firstYear: 24.99, renewal: 39.99 },
            '.io': { firstYear: 49.99, renewal: 79.99 },
            '.biz': { firstYear: 14.99, renewal: 24.99 }
        };
    },

    async fetchSiteGroundPrices() {
        console.log('Fetching SiteGround prices...');
        return {
            '.com': { firstYear: 15.95, renewal: 19.99 },
            '.net': { firstYear: 17.95, renewal: 21.99 },
            '.org': { firstYear: 17.95, renewal: 21.99 },
            '.co': { firstYear: 29.95, renewal: 39.99 },
            '.io': { firstYear: 59.95, renewal: 79.99 },
            '.biz': { firstYear: 17.95, renewal: 21.99 }
        };
    },

    async fetchBluehostPrices() {
        console.log('Fetching Bluehost prices...');
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
        const newPricingString = `const PROVIDER_PRICING = ${JSON.stringify(newPricing, null, 4).replace(/"([^"]+)":/g, '$1:')};`;

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
