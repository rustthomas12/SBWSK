/**
 * Business Name Generator
 * Pattern-based name generation algorithm
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nameGeneratorForm');
    const resultsContainer = document.getElementById('resultsContainer');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const businessType = document.getElementById('businessType').value;
        const keywords = document.getElementById('keywords').value;
        const location = document.getElementById('location').value;

        if (!businessType) {
            showAlert('Please select a business type', 'error', 'resultsContainer');
            return;
        }

        // Generate names
        const names = generateBusinessNames(businessType, keywords, location);

        // Display results
        displayResults(names);
    });
});

/**
 * Generate business names based on inputs
 * @param {string} businessType - Selected business type
 * @param {string} keywords - Optional keywords
 * @param {string} location - Optional location
 * @returns {Array} - Array of generated names
 */
function generateBusinessNames(businessType, keywords = '', location = '') {
    const names = new Set(); // Use Set to avoid duplicates

    // Get industry-specific terms
    const industryTerms = getIndustryTerms(businessType);

    // Parse keywords
    const keywordList = keywords
        ? keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k)
        : [];

    // Clean location
    const cleanLocation = location.trim();

    // Pattern 1: [Location] + [Industry]
    if (cleanLocation) {
        industryTerms.core.forEach(term => {
            names.add(`${cleanLocation} ${term}`);
        });
    }

    // Pattern 2: [Adjective] + [Industry]
    const adjectives = ['Premier', 'Elite', 'Quality', 'Pro', 'Expert', 'Reliable',
                       'Superior', 'Professional', 'Premier', 'Precision', 'Prime'];
    industryTerms.core.forEach(term => {
        adjectives.slice(0, 3).forEach(adj => {
            names.add(`${adj} ${term}`);
        });
    });

    // Pattern 3: [Location] + [Adjective] + [Industry]
    if (cleanLocation) {
        adjectives.slice(0, 2).forEach(adj => {
            industryTerms.core.slice(0, 2).forEach(term => {
                names.add(`${cleanLocation} ${adj} ${term}`);
            });
        });
    }

    // Pattern 4: [Keyword] + [Industry]
    keywordList.forEach(keyword => {
        industryTerms.core.forEach(term => {
            names.add(`${capitalize(keyword)} ${term}`);
        });
    });

    // Pattern 5: [Industry] + [Suffix]
    const suffixes = ['Pro', 'Plus', 'Direct', 'Express', 'Solutions',
                     'Group', 'Team', 'Experts', 'Masters'];
    industryTerms.short.forEach(term => {
        suffixes.slice(0, 4).forEach(suffix => {
            names.add(`${term} ${suffix}`);
        });
    });

    // Pattern 6: One-word creative names
    if (industryTerms.oneWord) {
        industryTerms.oneWord.forEach(name => names.add(name));
    }

    // Pattern 7: Location-based branded names
    if (cleanLocation) {
        const locShort = cleanLocation.split(' ')[0]; // Take first word
        industryTerms.action.forEach(action => {
            names.add(`${locShort}${action}`);
        });
    }

    // Convert Set to Array and limit to 20 names
    const nameArray = Array.from(names).slice(0, 20);

    // Return name objects with metadata
    return nameArray.map(name => ({
        name: name,
        domainBase: formatDomainName(name),
        length: name.length,
        score: scoreBusinessName(name)
    })).sort((a, b) => b.score - a.score); // Sort by score
}

/**
 * Get industry-specific terms
 * @param {string} industry - Industry type
 * @returns {Object} - Object with different term types
 */
function getIndustryTerms(industry) {
    const industries = {
        contractor: {
            core: ['Construction', 'Contracting', 'Builders', 'Build Co'],
            short: ['Build', 'Construction', 'Contracting'],
            action: ['Build', 'Construct', 'Remodel'],
            oneWord: ['BuildWorks', 'ConstructCo', 'BuildPro']
        },
        plumbing: {
            core: ['Plumbing', 'Plumbers', 'Plumbing Services'],
            short: ['Plumbing', 'Plumbers'],
            action: ['Plumb', 'Flow', 'Pipe'],
            oneWord: ['PlumbPro', 'FlowMaster', 'PipePro']
        },
        electrical: {
            core: ['Electric', 'Electrical Services', 'Electricians'],
            short: ['Electric', 'Electrical'],
            action: ['Power', 'Spark', 'Volt'],
            oneWord: ['PowerPro', 'SparkCo', 'VoltMaster']
        },
        hvac: {
            core: ['HVAC', 'Heating & Cooling', 'Climate Control'],
            short: ['HVAC', 'Climate'],
            action: ['Heat', 'Cool', 'Comfort'],
            oneWord: ['ComfortPro', 'ClimateCo', 'HVACMaster']
        },
        landscaping: {
            core: ['Landscaping', 'Lawn Care', 'Landscape Services'],
            short: ['Landscaping', 'Lawn Care'],
            action: ['Green', 'Grow', 'Turf'],
            oneWord: ['GreenScape', 'TurfPro', 'LawnMaster']
        },
        cleaning: {
            core: ['Cleaning Services', 'Cleaners', 'Cleaning'],
            short: ['Cleaning', 'Cleaners'],
            action: ['Shine', 'Sparkle', 'Fresh'],
            oneWord: ['ShineClean', 'SparklePro', 'FreshClean']
        },
        legal: {
            core: ['Law Firm', 'Legal Services', 'Attorneys'],
            short: ['Law', 'Legal'],
            action: ['Justice', 'Advocate', 'Counsel'],
            oneWord: ['JusticeLaw', 'CounselPro', 'LawGroup']
        },
        accounting: {
            core: ['Accounting', 'Tax Services', 'Financial Services'],
            short: ['Accounting', 'Finance'],
            action: ['Count', 'Calculate', 'Balance'],
            oneWord: ['CountPro', 'BalanceBooks', 'TaxMaster']
        },
        consulting: {
            core: ['Consulting', 'Consultants', 'Advisory Services'],
            short: ['Consulting', 'Advisory'],
            action: ['Advise', 'Strategy', 'Insight'],
            oneWord: ['StrategyPro', 'InsightCo', 'AdvisoryGroup']
        },
        realestate: {
            core: ['Real Estate', 'Realty', 'Properties'],
            short: ['Realty', 'Properties'],
            action: ['Home', 'Estate', 'Property'],
            oneWord: ['HomeFindr', 'EstatesPro', 'RealtyGroup']
        },
        salon: {
            core: ['Salon', 'Beauty Studio', 'Hair & Beauty'],
            short: ['Salon', 'Beauty'],
            action: ['Style', 'Glam', 'Beauty'],
            oneWord: ['StyleSalon', 'GlamStudio', 'BeautyBar']
        },
        fitness: {
            core: ['Fitness', 'Gym', 'Training Center'],
            short: ['Fitness', 'Gym'],
            action: ['Fit', 'Strong', 'Power'],
            oneWord: ['FitZone', 'PowerGym', 'StrongFit']
        },
        restaurant: {
            core: ['Restaurant', 'Cafe', 'Eatery'],
            short: ['Cafe', 'Kitchen'],
            action: ['Taste', 'Flavor', 'Bite'],
            oneWord: ['TasteBistro', 'FlavorCafe', 'BitesKitchen']
        },
        bakery: {
            core: ['Bakery', 'Bake Shop', 'Pastries'],
            short: ['Bakery', 'Bake Shop'],
            action: ['Bake', 'Rise', 'Flour'],
            oneWord: ['RiseBakery', 'FlourShop', 'BakeMaster']
        },
        retail: {
            core: ['Shop', 'Store', 'Boutique'],
            short: ['Shop', 'Store'],
            action: ['Market', 'Trade', 'Goods'],
            oneWord: ['MarketPlace', 'TradePost', 'ShopCo']
        },
        tech: {
            core: ['Technology', 'IT Services', 'Tech Solutions'],
            short: ['Tech', 'IT'],
            action: ['Digital', 'Cyber', 'Code'],
            oneWord: ['TechFlow', 'DigitalPro', 'CodeWorks']
        },
        medical: {
            core: ['Medical', 'Healthcare', 'Health Services'],
            short: ['Medical', 'Health'],
            action: ['Care', 'Heal', 'Wellness'],
            oneWord: ['CarePlus', 'HealWell', 'WellnessMed']
        },
        dental: {
            core: ['Dental', 'Dentistry', 'Dental Care'],
            short: ['Dental', 'Dentistry'],
            action: ['Smile', 'Bright', 'Care'],
            oneWord: ['SmileDental', 'BrightSmiles', 'CareDentistry']
        },
        pet: {
            core: ['Pet Services', 'Pet Care', 'Animal Care'],
            short: ['Pet Care', 'Pets'],
            action: ['Paw', 'Pet', 'Care'],
            oneWord: ['PawPro', 'PetParadise', 'CareVets']
        },
        auto: {
            core: ['Auto Repair', 'Auto Services', 'Mechanic'],
            short: ['Auto', 'Garage'],
            action: ['Drive', 'Motor', 'Gear'],
            oneWord: ['DriveShop', 'MotorPro', 'GearGarage']
        }
    };

    return industries[industry] || {
        core: ['Services', 'Solutions', 'Company'],
        short: ['Services'],
        action: ['Pro', 'Expert'],
        oneWord: ['ProServices']
    };
}

/**
 * Score a business name (higher is better)
 * @param {string} name - Business name to score
 * @returns {number} - Score from 0-100
 */
function scoreBusinessName(name) {
    let score = 50; // Base score

    // Prefer shorter names (easier to remember)
    if (name.length <= 15) score += 20;
    else if (name.length <= 20) score += 10;
    else if (name.length > 30) score -= 10;

    // Prefer 2-3 words
    const wordCount = name.split(' ').length;
    if (wordCount === 2 || wordCount === 3) score += 15;

    // Boost for alliteration
    const words = name.split(' ');
    if (words.length >= 2 && words[0][0] === words[1][0]) {
        score += 10;
    }

    // Prefer names without special characters
    if (!/[^a-zA-Z\s]/.test(name)) score += 5;

    return Math.min(100, Math.max(0, score));
}

/**
 * Capitalize first letter of string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Display generated names
 */
function displayResults(names) {
    const resultsContainer = document.getElementById('resultsContainer');

    let html = `
        <div style="max-width: 900px; margin: 0 auto;">
            <h3 class="section-title" style="font-size: 1.5rem; margin-bottom: 1.5rem;">
                Generated Names (${names.length})
            </h3>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
    `;

    names.forEach((nameObj, index) => {
        html += `
            <div class="result-card" style="position: relative;">
                ${index < 3 ? '<span class="badge badge-primary" style="position: absolute; top: 1rem; right: 1rem;">Top Pick</span>' : ''}
                <div style="margin-bottom: 1rem;">
                    <h4 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${nameObj.name}</h4>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); font-family: var(--font-mono);">
                        ${nameObj.domainBase}.com
                    </p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <a
                        href="domain-checker.html?domain=${encodeURIComponent(nameObj.domainBase)}"
                        class="btn btn-primary"
                        style="flex: 1;"
                    >
                        Check Domain
                    </a>
                    <button
                        type="button"
                        class="btn btn-outline"
                        onclick="saveFavorite('${nameObj.name.replace(/'/g, "\\'")}')"
                        title="Save to favorites"
                    >
                        ⭐
                    </button>
                </div>
            </div>
        `;
    });

    html += `
            </div>

            <div class="tool-card" style="margin-top: 2rem; background-color: #eff6ff;">
                <h4 style="margin-bottom: 1rem;">💡 Naming Tips</h4>
                <ul style="list-style: disc; padding-left: 1.5rem; color: var(--text-secondary);">
                    <li>Keep it short and memorable (2-3 words is ideal)</li>
                    <li>Make it easy to spell and pronounce</li>
                    <li>Check that the .com domain is available</li>
                    <li>Avoid names too similar to competitors</li>
                    <li>Consider how it looks on signs and business cards</li>
                </ul>
            </div>

            <div id="favoritesSection" class="hidden"></div>

            <div style="text-align: center; margin-top: 2rem;">
                <button type="button" class="btn btn-outline" onclick="window.location.reload()">
                    Generate More Names
                </button>
            </div>
        </div>
    `;

    resultsContainer.innerHTML = html;
    show(resultsContainer);

    // Show favorites if any exist
    displayFavorites();

    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Save name to favorites
 */
function saveFavorite(name) {
    let favorites = storage.get('favoriteNames', []);

    if (!favorites.includes(name)) {
        favorites.push(name);
        storage.set('favoriteNames', favorites);
        showAlert(`"${name}" saved to favorites!`, 'success', 'resultsContainer');
        displayFavorites();
    } else {
        showAlert(`"${name}" is already in your favorites`, 'info', 'resultsContainer');
    }
}

/**
 * Display saved favorites
 */
function displayFavorites() {
    const favorites = storage.get('favoriteNames', []);
    const favoritesSection = document.getElementById('favoritesSection');

    if (!favoritesSection) return;

    if (favorites.length === 0) {
        hide(favoritesSection);
        return;
    }

    let html = `
        <div class="tool-card" style="margin-top: 2rem; background-color: #fef3c7;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4>⭐ Your Favorite Names (${favorites.length})</h4>
                <button type="button" class="btn btn-outline" onclick="clearFavorites()" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                    Clear All
                </button>
            </div>
            <ul style="list-style: none; padding: 0;">
    `;

    favorites.forEach(name => {
        const domainBase = formatDomainName(name);
        html += `
            <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: var(--radius-md); margin-bottom: 0.5rem;">
                <span style="font-weight: 600;">${name}</span>
                <a href="domain-checker.html?domain=${encodeURIComponent(domainBase)}" class="btn btn-primary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                    Check Domain
                </a>
            </li>
        `;
    });

    html += `
            </ul>
        </div>
    `;

    favoritesSection.innerHTML = html;
    show(favoritesSection);
}

/**
 * Clear all favorites
 */
function clearFavorites() {
    if (confirm('Are you sure you want to clear all favorite names?')) {
        storage.remove('favoriteNames');
        displayFavorites();
        showAlert('Favorites cleared', 'info', 'resultsContainer');
    }
}
