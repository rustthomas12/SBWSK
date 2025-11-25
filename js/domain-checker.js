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
 * Check domain availability for multiple TLDs
 * @param {string} domainName - The base domain name
 * @returns {Promise<Array>} - Array of domain results
 */
async function checkMultipleTLDs(domainName) {
    const tlds = [
        { extension: '.com', price: 12.99, priority: 1 },
        { extension: '.net', price: 14.99, priority: 2 },
        { extension: '.org', price: 14.99, priority: 3 },
        { extension: '.co', price: 24.99, priority: 4 },
        { extension: '.io', price: 39.99, priority: 5 },
        { extension: '.biz', price: 15.99, priority: 6 }
    ];

    const results = [];

    for (const tld of tlds) {
        const fullDomain = domainName + tld.extension;
        const availability = await checkDomainAvailability(fullDomain);

        results.push({
            domain: fullDomain,
            extension: tld.extension,
            available: availability.available,
            price: tld.price,
            priority: tld.priority
        });
    }

    // Sort by priority (preferred TLDs first)
    return results.sort((a, b) => a.priority - b.priority);
}

/**
 * Check if a specific domain is available
 *
 * MVP: Uses mock logic
 * Production: Replace with actual API call
 *
 * @param {string} domain - Full domain name (e.g., "example.com")
 * @returns {Promise<Object>} - { available: boolean, price: number }
 */
async function checkDomainAvailability(domain) {
    // TODO: Replace with real API call in production
    // Example:
    // const response = await fetch('/api/check-domain', {
    //     method: 'POST',
    //     body: JSON.stringify({ domain })
    // });
    // return await response.json();

    // Mock logic for MVP:
    // Simulate availability based on simple criteria
    const mockAvailable = Math.random() > 0.5; // 50% chance available

    // Some common domains are likely taken
    const commonWords = ['best', 'top', 'pro', 'shop', 'store', 'online', 'web', 'digital'];
    const containsCommonWord = commonWords.some(word => domain.toLowerCase().includes(word));

    const available = containsCommonWord ? Math.random() > 0.7 : mockAvailable;

    return {
        available,
        domain
    };
}

/**
 * Display search results
 * @param {string} domainName - The base domain name searched
 * @param {Array} results - Array of domain results
 */
function displayResults(domainName, results) {
    const resultsContainer = document.getElementById('resultsContainer');

    // Separate available and unavailable domains
    const available = results.filter(r => r.available);
    const unavailable = results.filter(r => !r.available);

    let html = `
        <div style="max-width: 800px; margin: 0 auto;">
            <h3 class="section-title" style="font-size: 1.5rem; margin-bottom: 1.5rem;">
                Results for "${domainName}"
            </h3>
    `;

    // Show available domains first
    if (available.length > 0) {
        html += `<div style="margin-bottom: 2rem;">`;
        available.forEach(result => {
            html += createDomainResultCard(result, true);
        });
        html += `</div>`;
    }

    // Show unavailable domains
    if (unavailable.length > 0) {
        html += `
            <h4 style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 1.125rem;">
                Already Registered
            </h4>
        `;
        unavailable.forEach(result => {
            html += createDomainResultCard(result, false);
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
 * Create a result card for a domain
 * @param {Object} result - Domain result object
 * @param {boolean} available - Whether domain is available
 * @returns {string} - HTML string
 */
function createDomainResultCard(result, available) {
    const cardClass = available ? 'available' : 'unavailable';
    const statusBadge = available
        ? '<span class="badge badge-success">Available</span>'
        : '<span class="badge badge-secondary">Taken</span>';

    const affiliateUrl = `https://bluehost.sjv.io/DyaJob?domain=${encodeURIComponent(result.domain)}`;

    return `
        <div class="result-card ${cardClass}" style="margin-bottom: 1rem;">
            <div class="result-header">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <span class="result-title">${result.domain}</span>
                        ${statusBadge}
                    </div>
                </div>
                <div class="result-price">${formatCurrency(result.price)}/yr</div>
            </div>
            ${available ? `
                <a
                    href="${affiliateUrl}"
                    target="_blank"
                    rel="noopener"
                    class="btn btn-primary btn-block register-domain-btn"
                    data-domain="${result.domain}"
                >
                    Register ${result.domain} →
                </a>
            ` : `
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">
                    This domain is already registered. Try a different extension or variation.
                </p>
            `}
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
