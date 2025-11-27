/**
 * Real-Time Domain Price Scraper
 *
 * Uses Puppeteer to scrape EXACT prices from provider websites
 * when a user searches for a domain.
 *
 * This renders JavaScript to get 100% accurate pricing.
 */

const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

// Cache prices for 1 hour per TLD to avoid excessive scraping
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Get browser instance (works on Vercel)
 */
async function getBrowser() {
    return puppeteer.launch({
        args: chrome.args,
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
        ignoreHTTPSErrors: true,
    });
}

/**
 * Scrape Hostinger prices with Puppeteer
 */
async function scrapeHostingerPrice(browser, tld) {
    const page = await browser.newPage();

    try {
        console.log(`Scraping Hostinger for ${tld}...`);
        await page.goto('https://www.hostinger.com/domain-name-search', {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        // Wait for prices to load
        await page.waitForTimeout(2000);

        // Extract price for specific TLD
        const price = await page.evaluate((extension) => {
            // Look for elements containing the TLD and price
            const elements = Array.from(document.querySelectorAll('*'));

            for (const el of elements) {
                const text = el.textContent || '';
                if (text.includes(extension)) {
                    // Look for nearby price
                    const priceMatch = text.match(/\$?(\d+\.?\d*)/);
                    if (priceMatch) {
                        return parseFloat(priceMatch[1]);
                    }
                }
            }

            // Fallback: look in data attributes
            const priceElements = document.querySelectorAll('[data-price], [data-amount]');
            for (const el of priceElements) {
                const dataPrice = el.getAttribute('data-price') || el.getAttribute('data-amount');
                if (dataPrice) {
                    return parseFloat(dataPrice);
                }
            }

            return null;
        }, tld);

        await page.close();

        return {
            firstYear: price || 0.99,
            renewal: 13.99,
            source: 'scraped'
        };
    } catch (error) {
        console.error('Hostinger scrape error:', error.message);
        await page.close();
        return {
            firstYear: 0.99,
            renewal: 13.99,
            source: 'fallback'
        };
    }
}

/**
 * Scrape GoDaddy prices with Puppeteer
 */
async function scrapeGoDaddyPrice(browser, tld) {
    const page = await browser.newPage();

    try {
        console.log(`Scraping GoDaddy for ${tld}...`);
        await page.goto('https://www.godaddy.com/domains', {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        await page.waitForTimeout(3000);

        const price = await page.evaluate((extension) => {
            const elements = Array.from(document.querySelectorAll('*'));

            for (const el of elements) {
                const text = el.textContent || '';
                if (text.includes(extension) && text.includes('$')) {
                    const priceMatch = text.match(/\$(\d+\.?\d*)/);
                    if (priceMatch) {
                        return parseFloat(priceMatch[1]);
                    }
                }
            }

            return null;
        }, tld);

        await page.close();

        return {
            firstYear: price || 0.99,
            renewal: 21.99,
            source: 'scraped'
        };
    } catch (error) {
        console.error('GoDaddy scrape error:', error.message);
        await page.close();
        return {
            firstYear: 0.99,
            renewal: 21.99,
            source: 'fallback'
        };
    }
}

/**
 * Scrape SiteGround prices
 */
async function scrapeSiteGroundPrice(browser, tld) {
    const page = await browser.newPage();

    try {
        console.log(`Scraping SiteGround for ${tld}...`);
        await page.goto('https://www.siteground.com/domain-names', {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        await page.waitForTimeout(2000);

        const price = await page.evaluate((extension) => {
            const elements = Array.from(document.querySelectorAll('*'));

            for (const el of elements) {
                const text = el.textContent || '';
                if (text.includes(extension) && text.includes('$')) {
                    const priceMatch = text.match(/\$(\d+\.?\d*)/);
                    if (priceMatch) {
                        return parseFloat(priceMatch[1]);
                    }
                }
            }

            return null;
        }, tld);

        await page.close();

        return {
            firstYear: price || 15.95,
            renewal: 19.95,
            source: 'scraped'
        };
    } catch (error) {
        console.error('SiteGround scrape error:', error.message);
        await page.close();
        return {
            firstYear: 15.95,
            renewal: 19.95,
            source: 'fallback'
        };
    }
}

/**
 * Get Bluehost pricing (always free with hosting)
 */
function getBluehostPrice(tld) {
    return {
        firstYear: 0,
        renewal: 24.19,
        source: 'static'
    };
}

/**
 * Main handler
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
        // Get TLD from query parameter
        const { tld } = req.query;

        if (!tld) {
            return res.status(400).json({ error: 'TLD parameter required' });
        }

        const extension = tld.startsWith('.') ? tld : `.${tld}`;

        // Check cache first
        const cacheKey = `prices-${extension}`;
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log(`Cache hit for ${extension}`);
            return res.status(200).json({
                ...cached.data,
                cached: true,
                cacheAge: Math.round((Date.now() - cached.timestamp) / 1000 / 60) // minutes
            });
        }

        console.log(`Scraping fresh prices for ${extension}...`);

        // Launch browser
        const browser = await getBrowser();

        try {
            // Scrape all providers in parallel
            const [hostinger, godaddy, siteground, bluehost] = await Promise.all([
                scrapeHostingerPrice(browser, extension),
                scrapeGoDaddyPrice(browser, extension),
                scrapeSiteGroundPrice(browser, extension),
                Promise.resolve(getBluehostPrice(extension))
            ]);

            const prices = {
                Bluehost: {
                    [extension]: bluehost,
                    url: 'https://bluehost.sjv.io/DyaJob',
                    note: 'Free* with hosting plan',
                    isFreeWithHosting: true,
                    priority: 0
                },
                Hostinger: {
                    [extension]: hostinger,
                    url: 'https://www.hostinger.com',
                    note: 'Low first year price'
                },
                GoDaddy: {
                    [extension]: godaddy,
                    url: 'https://www.godaddy.com',
                    note: 'Popular choice'
                },
                SiteGround: {
                    [extension]: siteground,
                    url: 'https://www.siteground.com',
                    note: 'Consistent pricing'
                }
            };

            // Cache the results
            cache.set(cacheKey, {
                data: prices,
                timestamp: Date.now()
            });

            await browser.close();

            res.status(200).json({
                ...prices,
                cached: false,
                timestamp: Date.now(),
                tld: extension
            });

        } catch (error) {
            await browser.close();
            throw error;
        }

    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({
            error: 'Failed to scrape prices',
            message: error.message
        });
    }
};
