/**
 * Domain Checker Functionality
 *
 * MVP Implementation: Uses mock data to simulate domain checking
 * Production: Replace checkDomainAvailability() with real API calls
 *
 * Suggested APIs for production:
 * - Namecheap API
 * - GoDaddy API
 * - Domain.com API
 * - Or use a WHOIS lookup service
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('domainSearchForm');
    const domainInput = document.getElementById('domainName');
    const resultsContainer = document.getElementById('resultsContainer');

    // Check if domain is passed in URL (from Name Generator)
    const urlParams = new URLSearchParams(window.location.search);
    const domainFromUrl = urlParams.get('domain');
    if (domainFromUrl) {
        domainInput.value = domainFromUrl;
        form.dispatchEvent(new Event('submit'));
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const domainName = formatDomainName(domainInput.value);

        if (!domainName) {
            showAlert('Please enter a valid domain name', 'error', 'resultsContainer');
            return;
        }

        // Show loading state
        resultsContainer.innerHTML = `
            <div class="tool-card text-center">
                <div class="spinner" style="width: 40px; height: 40px; border-width: 4px;"></div>
                <p style="margin-top: 1rem; color: var(--text-secondary);">Checking availability...</p>
            </div>
        `;
        show(resultsContainer);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Check availability for multiple TLDs
        const results = await checkMultipleTLDs(domainName);

        // Display results
        displayResults(domainName, results);
    });
});

/**
 * Price data from multiple providers (updated 2025)
 * firstYear: Initial registration price
 * renewal: Annual renewal price
 */
const PROVIDER_PRICING = {
    'Bluehost': {
        '.com': { firstYear: 0, renewal: 24.19 },
        '.net': { firstYear: 0, renewal: 20.19 },
        '.org': { firstYear: 0, renewal: 19.19 },
        '.co': { firstYear: 0, renewal: 34.99 },
        '.io': { firstYear: 0, renewal: 64.99 },
        '.biz': { firstYear: 0, renewal: 24.99 },
        url: 'https://bluehost.sjv.io/DyaJob',
        note: 'Free* with hosting plan',
        isFreeWithHosting: true,
        priority: 0
    },
    'Hostinger': {
        '.com': { firstYear: 10.19, renewal: 18.19 },
        '.net': { firstYear: 15.19, renewal: 18.19 },
        '.org': { firstYear: 8.19, renewal: 16.19 },
        '.co': { firstYear: 11.99, renewal: 32.99 },
        '.io': { firstYear: 42.99, renewal: 64.99 },
        '.biz': { firstYear: 13.99, renewal: 18.19 },
        url: 'https://www.hostinger.com',
        note: 'Low first year price'
    },
    'GoDaddy': {
        '.com': { firstYear: 11.99, renewal: 24.99 },
        '.net': { firstYear: 14.99, renewal: 24.99 },
        '.org': { firstYear: 14.99, renewal: 24.99 },
        '.co': { firstYear: 24.99, renewal: 39.99 },
        '.io': { firstYear: 49.99, renewal: 79.99 },
        '.biz': { firstYear: 14.99, renewal: 24.99 },
        url: 'https://www.godaddy.com',
        note: 'Popular choice'
    },
    'SiteGround': {
        '.com': { firstYear: 15.95, renewal: 19.99 },
        '.net': { firstYear: 17.95, renewal: 21.99 },
        '.org': { firstYear: 17.95, renewal: 21.99 },
        '.co': { firstYear: 29.95, renewal: 39.99 },
        '.io': { firstYear: 59.95, renewal: 79.99 },
        '.biz': { firstYear: 17.95, renewal: 21.99 },
        url: 'https://www.siteground.com',
        note: 'Consistent pricing'
    }
};

/**
 * Check domain availability for multiple TLDs
 * @param {string} domainName - The base domain name
 * @returns {Promise<Array>} - Array of domain results
 */
async function checkMultipleTLDs(domainName) {
    const tlds = [
        { extension: '.com', priority: 1 },
        { extension: '.net', priority: 2 },
        { extension: '.org', priority: 3 },
        { extension: '.co', priority: 4 },
        { extension: '.io', priority: 5 },
        { extension: '.biz', priority: 6 }
    ];

    const results = [];

    for (const tld of tlds) {
        const fullDomain = domainName + tld.extension;
        const availability = await checkDomainAvailability(fullDomain);

        // Get lowest first year price across providers
        const prices = Object.keys(PROVIDER_PRICING).map(provider => {
            const pricing = PROVIDER_PRICING[provider][tld.extension];
            return pricing ? pricing.firstYear : 99.99;
        });
        const lowestPrice = Math.min(...prices);

        results.push({
            domain: fullDomain,
            extension: tld.extension,
            available: availability.available,
            lowestPrice: lowestPrice,
            priority: tld.priority,
            error: availability.error,
            registrationInfo: availability.registrationInfo
        });
    }

    // Sort by priority (preferred TLDs first)
    return results.sort((a, b) => a.priority - b.priority);
}

/**
 * Check if a specific domain is available using Google's Public DNS API
 * This runs entirely client-side and requires no authentication
 * @param {string} domain - Full domain name (e.g., "example.com")
 * @returns {Promise<Object>} - { available: boolean, registrationInfo: object }
 */
async function checkDomainAvailability(domain) {
    try {
        // Use Google's Public DNS API - free, no auth required
        const dnsApiUrl = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`;

        const response = await fetch(dnsApiUrl);

        if (!response.ok) {
            throw new Error('DNS lookup failed');
        }

        const dnsData = await response.json();

        let available = true;
        let registrationInfo = null;

        // Check DNS status codes:
        // 0 = NOERROR (domain exists with records)
        // 3 = NXDOMAIN (domain doesn't exist)
        if (dnsData.Answer || dnsData.Status === 0) {
            // Domain has DNS records = definitely registered
            available = false;
            registrationInfo = {
                note: 'Domain is registered and has DNS records'
            };
        } else if (dnsData.Status === 3) {
            // NXDOMAIN = domain doesn't exist
            // But check for nameservers too (domain might be registered but not configured)
            const nsApiUrl = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=NS`;
            const nsResponse = await fetch(nsApiUrl);
            const nsData = await nsResponse.json();

            if (nsData.Answer) {
                // Has nameservers = registered
                available = false;
                registrationInfo = {
                    note: 'Domain is registered but not yet configured'
                };
            } else {
                // No DNS records, no nameservers = likely available
                available = true;
            }
        } else {
            // Other status - domain likely available
            available = true;
        }

        return {
            available,
            domain,
            registrationInfo,
            error: false
        };
    } catch (error) {
        console.error('Error checking domain:', error);
        // Return unknown state if DNS lookup fails
        return {
            available: null,
            domain,
            error: true,
            errorMessage: 'Unable to check availability. Please try again.'
        };
    }
}

/**
 * Display search results
 * @param {string} domainName - The base domain name searched
 * @param {Array} results - Array of domain results
 */
function displayResults(domainName, results) {
    const resultsContainer = document.getElementById('resultsContainer');

    // Separate available, unavailable, and error domains
    const available = results.filter(r => r.available === true);
    const unavailable = results.filter(r => r.available === false);
    const errors = results.filter(r => r.available === null || r.error);

    let html = `
        <div style="max-width: 800px; margin: 0 auto;">
            <h3 class="section-title" style="font-size: 1.5rem; margin-bottom: 1.5rem;">
                Results for "${domainName}"
            </h3>
    `;

    // Show unavailable domains first
    if (unavailable.length > 0) {
        html += `
            <h4 style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 1.125rem;">
                Already Registered
            </h4>
        `;
        unavailable.forEach(result => {
            html += createDomainResultCard(result, false);
        });
        html += `<div style="margin-bottom: 2rem;"></div>`;
    }

    // Show available domains
    if (available.length > 0) {
        html += `
            <h4 style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 1.125rem;">
                Available Domains
            </h4>
        `;
        available.forEach(result => {
            html += createDomainResultCard(result, true);
        });
    }

    // Show error domains
    if (errors.length > 0) {
        html += `
            <h4 style="color: #f59e0b; margin-bottom: 1rem; font-size: 1.125rem;">
                ⚠️ Unable to Check
            </h4>
        `;
        errors.forEach(result => {
            html += `
                <div class="result-card" style="margin-bottom: 1rem; border: 2px solid #fef3c7; background: #fffbeb;">
                    <div style="padding: 1rem;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <span style="font-weight: 600;">${result.domain}</span>
                            <span class="badge" style="background: #f59e0b;">Error</span>
                        </div>
                        <p style="color: #92400e; font-size: 0.875rem; margin-top: 0.5rem;">
                            Could not verify availability. Try checking directly with a registrar or try again later.
                        </p>
                    </div>
                </div>
            `;
        });
    }

    // Add alternative suggestions
    html += `
        <div class="tool-card" style="margin-top: 2rem; background-color: #f0f9ff;">
            <h4 style="margin-bottom: 1rem;">💡 Pro Tips</h4>
            <ul style="list-style: disc; padding-left: 1.5rem; color: var(--text-secondary);">
                <li>Try adding your location (e.g., "${domainName}boston")</li>
                <li>Use your industry (e.g., "${domainName}plumbing")</li>
                <li>Add action words (e.g., "get${domainName}", "${domainName}now")</li>
                <li>Consider abbreviations or creative spellings</li>
            </ul>
        </div>
    `;

    html += `</div>`;

    resultsContainer.innerHTML = html;
    show(resultsContainer);

    // Add event listeners to register buttons
    document.querySelectorAll('.register-domain-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const domain = btn.dataset.domain;
            trackAffiliateClick('domain-register-' + domain);
        });
    });
}

/**
 * Create a result card for a domain with price comparison
 * @param {Object} result - Domain result object
 * @param {boolean} available - Whether domain is available
 * @returns {string} - HTML string
 */
function createDomainResultCard(result, available) {
    const cardClass = available ? 'available' : 'unavailable';
    const statusBadge = available
        ? '<span class="badge badge-success">Available</span>'
        : '<span class="badge badge-secondary">Taken</span>';

    // Build price comparison table
    let priceComparisonHTML = '';
    if (available) {
        priceComparisonHTML = `
            <div style="margin: 1rem 0; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                <h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem; color: #475569;">
                    Compare Prices
                </h4>
                <div style="display: grid; gap: 0.5rem;">
        `;

        // Sort providers - Bluehost first (priority 0), then by first year price
        const providersByPrice = Object.keys(PROVIDER_PRICING)
            .map(provider => {
                const pricing = PROVIDER_PRICING[provider][result.extension];
                return {
                    name: provider,
                    firstYear: pricing ? pricing.firstYear : 99.99,
                    renewal: pricing ? pricing.renewal : 99.99,
                    url: PROVIDER_PRICING[provider].url,
                    note: PROVIDER_PRICING[provider].note,
                    priority: PROVIDER_PRICING[provider].priority || 999,
                    isFreeWithHosting: PROVIDER_PRICING[provider].isFreeWithHosting || false
                };
            })
            .sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return a.firstYear - b.firstYear;
            });

        providersByPrice.forEach((provider, index) => {
            const isFirst = index === 0;

            let priceDisplay;
            if (provider.isFreeWithHosting) {
                priceDisplay = `
                    <div style="text-align: right;">
                        <div style="font-size: 1.125rem; font-weight: 700; color: #10b981;">Free*</div>
                        <div style="font-size: 0.75rem; color: #64748b;">Then ${formatCurrency(provider.renewal)}/yr</div>
                    </div>
                `;
            } else {
                priceDisplay = `
                    <div style="text-align: right;">
                        <div style="font-size: 1.125rem; font-weight: 700; color: #1e293b;">${formatCurrency(provider.firstYear)}</div>
                        <div style="font-size: 0.75rem; color: #64748b;">Renews ${formatCurrency(provider.renewal)}/yr</div>
                    </div>
                `;
            }

            priceComparisonHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: white; border-radius: 4px; border: ${isFirst ? '2px solid #10b981' : '1px solid #e2e8f0'};">
                    <div>
                        <span style="font-weight: 600; color: #1e293b;">${provider.name}</span>
                        <span style="display: block; font-size: 0.75rem; color: #64748b;">${provider.note}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        ${priceDisplay}
                        <a href="${provider.url}" target="_blank" rel="noopener" class="btn btn-sm"
                           style="padding: 0.375rem 0.75rem; font-size: 0.875rem; white-space: nowrap;"
                           onclick="trackAffiliateClick('${provider.name.toLowerCase()}-${result.domain}')">
                            Buy →
                        </a>
                    </div>
                </div>
            `;
        });

        priceComparisonHTML += `
                </div>
                <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.5rem; font-style: italic;">
                    *Free for first year when purchased with a hosting plan
                </p>
            </div>
        `;
    }

    return `
        <div class="result-card ${cardClass}" style="margin-bottom: 1.5rem; border: 2px solid ${available ? '#10b981' : '#e2e8f0'}; border-radius: 12px; overflow: hidden;">
            <div class="result-header" style="padding: 1rem; background: ${available ? '#ecfdf5' : '#f8fafc'};">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span class="result-title" style="font-size: 1.25rem; font-weight: 700;">${result.domain}</span>
                        ${statusBadge}
                    </div>
                    <div class="result-price" style="font-size: 1rem; color: #64748b;">
                        ${available ? `Starting at ${formatCurrency(result.lowestPrice)}/yr` : 'Unavailable'}
                    </div>
                </div>
            </div>
            <div style="padding: ${available ? '0 1rem 1rem' : '1rem'};">
                ${available ? priceComparisonHTML : `
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">
                        ${result.registrationInfo ? `Registered with ${result.registrationInfo.registrar || 'unknown registrar'}.` : ''}
                        This domain is already taken. Try a different extension or variation.
                    </p>
                `}
            </div>
        </div>
    `;
}

/**
 * Generate alternative domain suggestions
 * @param {string} baseDomain - The base domain name
 * @returns {Array} - Array of suggested alternatives
 */
function generateAlternatives(baseDomain) {
    const prefixes = ['get', 'my', 'the', 'try'];
    const suffixes = ['hq', 'pro', 'now', 'online', 'web'];

    const alternatives = [];

    // Add prefix variations
    prefixes.forEach(prefix => {
        alternatives.push(prefix + baseDomain);
    });

    // Add suffix variations
    suffixes.forEach(suffix => {
        alternatives.push(baseDomain + suffix);
    });

    return alternatives;
}
