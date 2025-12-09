/**
 * Google Ads API Keyword Research Tool
 * Vercel Serverless Function
 *
 * Generates Local and General SEO keyword recommendations using Google Ads API
 */

const { GoogleAdsApi } = require('google-ads-api');

// ==========================================
// CONFIGURATION
// ==========================================

// Google Ads API credentials from environment variables
const GOOGLE_ADS_CONFIG = {
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
};

const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID; // Format: 123-456-7890

// ==========================================
// GOOGLE ADS GEO LOCATION MAPPING
// ==========================================

/**
 * Country codes for fallback
 * Full list: https://developers.google.com/google-ads/api/data/geotargets
 */
const COUNTRY_CODES = {
  'US': '2840',  // United States
  'CA': '2124',  // Canada
  'GB': '2826',  // United Kingdom
  'AU': '2036',  // Australia
  'DE': '2276',  // Germany
  'FR': '2250',  // France
  'IT': '2380',  // Italy
  'ES': '2724',  // Spain
  'NL': '2528',  // Netherlands
  'SE': '2752',  // Sweden
  'NO': '2578',  // Norway
  'DK': '2208',  // Denmark
  'FI': '2246',  // Finland
  'IE': '2372',  // Ireland
  'NZ': '2554',  // New Zealand
  'IN': '2356',  // India
  'SG': '2702',  // Singapore
  'MY': '2458',  // Malaysia
  'PH': '2608',  // Philippines
  'TH': '2764',  // Thailand
  'JP': '2392',  // Japan
  'KR': '2410',  // South Korea
  'MX': '2484',  // Mexico
  'BR': '2076',  // Brazil
  'AR': '2032',  // Argentina
  'CL': '2152',  // Chile
  'ZA': '2710',  // South Africa
};

/**
 * US State geo target IDs for more specific targeting
 */
const US_STATES = {
  'AL': '21132', 'AK': '21133', 'AZ': '21134', 'AR': '21135', 'CA': '21137',
  'CO': '21138', 'CT': '21139', 'DE': '21140', 'FL': '21141', 'GA': '21142',
  'HI': '21143', 'ID': '21144', 'IL': '21145', 'IN': '21146', 'IA': '21147',
  'KS': '21148', 'KY': '21149', 'LA': '21150', 'ME': '21151', 'MD': '21152',
  'MA': '21153', 'MI': '21154', 'MN': '21155', 'MS': '21156', 'MO': '21157',
  'MT': '21158', 'NE': '21159', 'NV': '21160', 'NH': '21161', 'NJ': '21162',
  'NM': '21163', 'NY': '21164', 'NC': '21165', 'ND': '21166', 'OH': '21167',
  'OK': '21168', 'OR': '21169', 'PA': '21170', 'RI': '21171', 'SC': '21172',
  'SD': '21173', 'TN': '21174', 'TX': '21176', 'UT': '21177', 'VT': '21178',
  'VA': '21179', 'WA': '21180', 'WV': '21181', 'WI': '21182', 'WY': '21183',
  'DC': '21136'
};

/**
 * Determines geo target ID for location
 * Uses state-level targeting for reliability (works for all cities in that state)
 */
function findGeoTargetId(city, state, country = 'US') {
  // For US, try to use state if available
  if (country === 'US' && state && US_STATES[state.toUpperCase()]) {
    console.log(`Using state-level targeting for ${state}: ${US_STATES[state.toUpperCase()]}`);
    return US_STATES[state.toUpperCase()];
  }

  // Fallback to country
  const countryId = COUNTRY_CODES[country] || COUNTRY_CODES['US'];
  console.log(`Using country-level targeting for ${country}: ${countryId}`);
  return countryId;
}

// ==========================================
// KEYWORD GENERATION LOGIC
// ==========================================

/**
 * Generates seed keywords from business inputs
 */
function generateSeedKeywords(businessType, services, city, region) {
  const seeds = [];

  // Base business type keywords
  if (businessType) {
    seeds.push(businessType);
    seeds.push(`${businessType} services`);
    seeds.push(`${businessType} near me`);

    // Local variations
    if (city) {
      seeds.push(`${businessType} ${city}`);
      seeds.push(`${businessType} in ${city}`);
    }
    if (city && region) {
      seeds.push(`${businessType} ${city} ${region}`);
    }
  }

  // Service-specific keywords
  if (services && services.length > 0) {
    services.forEach(service => {
      const trimmedService = service.trim();
      if (trimmedService) {
        seeds.push(trimmedService);
        seeds.push(`${trimmedService} near me`);

        if (city) {
          seeds.push(`${trimmedService} ${city}`);
          seeds.push(`${trimmedService} in ${city}`);
        }
        if (city && region) {
          seeds.push(`${trimmedService} ${city} ${region}`);
        }
      }
    });
  }

  return seeds;
}

/**
 * Determines if a keyword is location-specific (Local SEO)
 */
function isLocalKeyword(keyword, city, region) {
  const lowerKeyword = keyword.toLowerCase();
  const cityLower = city ? city.toLowerCase() : '';
  const regionLower = region ? region.toLowerCase() : '';

  // Check for location indicators
  const localIndicators = [
    'near me',
    'nearby',
    'local',
    'in my area',
    cityLower,
    regionLower,
  ].filter(Boolean);

  return localIndicators.some(indicator => lowerKeyword.includes(indicator));
}

/**
 * Scores a keyword based on search volume, competition, and CPC
 * Higher score = better opportunity
 */
function scoreKeyword(keyword) {
  const volume = keyword.avgMonthlySearches || 0;
  const competition = keyword.competition || 'UNSPECIFIED';
  const cpc = keyword.cpc || 0;

  let score = 0;

  // Volume score (logarithmic to prevent huge numbers from dominating)
  if (volume > 0) {
    score += Math.log10(volume + 1) * 20;
  }

  // Competition score (prefer LOW and MEDIUM)
  if (competition === 'LOW') {
    score += 30;
  } else if (competition === 'MEDIUM') {
    score += 20;
  } else if (competition === 'HIGH') {
    score += 5;
  }

  // CPC score (higher CPC = higher commercial intent)
  if (cpc > 0) {
    score += Math.min(cpc * 2, 20); // Cap at 20 points
  }

  // Volume sweet spot bonus (50-5000 searches/month)
  if (volume >= 50 && volume <= 5000) {
    score += 15;
  }

  return Math.round(score * 100) / 100; // Round to 2 decimals
}

// ==========================================
// GOOGLE ADS API INTEGRATION
// ==========================================

/**
 * Fetches keyword ideas from Google Ads API
 */
async function fetchKeywordIdeas(customer, seedKeywords, geoTargetId, maxResults = 50) {
  try {
    // Build the keyword plan idea request
    const request = {
      customer_id: GOOGLE_ADS_CUSTOMER_ID,
      language: '1000', // English (resource name: languageConstants/1000)
      geo_target_constants: [`geoTargetConstants/${geoTargetId}`],
      include_adult_keywords: false,
      keyword_plan_network: 'GOOGLE_SEARCH',

      // Seed keywords
      keyword_seed: {
        keywords: seedKeywords,
      },
    };

    // Call Google Ads API
    const response = await customer.keywordPlanIdeas.generateKeywordIdeas(request);

    // Process results
    const results = [];
    for (const idea of response) {
      const metrics = idea.keyword_idea_metrics;

      results.push({
        keyword: idea.text,
        avgMonthlySearches: metrics.avg_monthly_searches || 0,
        competition: metrics.competition || 'UNSPECIFIED',
        competitionIndex: metrics.competition_index || 0, // 0-100 scale
        cpc: (metrics.low_top_of_page_bid_micros || 0) / 1000000, // Convert micros to dollars
        cpcHigh: (metrics.high_top_of_page_bid_micros || 0) / 1000000,
      });

      // Stop if we have enough results
      if (results.length >= maxResults * 3) break; // Get extra for filtering
    }

    return results;

  } catch (error) {
    console.error('Google Ads API Error:', error);
    throw new Error(`Failed to fetch keyword ideas: ${error.message}`);
  }
}

// ==========================================
// MAIN HANDLER
// ==========================================

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body
    const {
      businessType,
      services, // Array or comma-separated string
      city,
      region,
      country = 'US',
      seedKeywords, // Optional override
      keywordTypePreferences = { local: true, general: true },
      maxResults = 50,
    } = req.body;

    // Validation
    if (!businessType && !services && !seedKeywords) {
      return res.status(400).json({
        error: 'Please provide at least one of: business type, services, or seed keywords'
      });
    }

    // Parse services if it's a string
    let servicesArray = [];
    if (typeof services === 'string') {
      servicesArray = services.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(services)) {
      servicesArray = services;
    }

    // Generate seed keywords
    let seeds = [];
    if (seedKeywords && Array.isArray(seedKeywords) && seedKeywords.length > 0) {
      // User provided custom seeds
      seeds = seedKeywords;
    } else {
      // Generate from business inputs
      seeds = generateSeedKeywords(businessType, servicesArray, city, region);
    }

    if (seeds.length === 0) {
      return res.status(400).json({
        error: 'No valid keywords could be generated from your inputs'
      });
    }

    // Get geo target ID (state or country level)
    const geoTargetId = findGeoTargetId(city, region, country);

    // Initialize Google Ads API client
    const client = new GoogleAdsApi(GOOGLE_ADS_CONFIG);
    const customer = client.Customer({
      customer_id: GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: GOOGLE_ADS_CONFIG.refresh_token,
    });

    // Fetch keyword ideas from Google Ads API
    const rawKeywords = await fetchKeywordIdeas(customer, seeds, geoTargetId, maxResults);

    // Score all keywords
    const scoredKeywords = rawKeywords.map(kw => ({
      ...kw,
      score: scoreKeyword(kw),
    }));

    // Separate into Local and General categories
    const localKeywords = [];
    const generalKeywords = [];

    scoredKeywords.forEach(kw => {
      if (isLocalKeyword(kw.keyword, city, region)) {
        localKeywords.push(kw);
      } else {
        generalKeywords.push(kw);
      }
    });

    // Sort by score (descending)
    localKeywords.sort((a, b) => b.score - a.score);
    generalKeywords.sort((a, b) => b.score - a.score);

    // Limit results based on user preference
    const finalLocal = keywordTypePreferences.local
      ? localKeywords.slice(0, maxResults)
      : [];

    const finalGeneral = keywordTypePreferences.general
      ? generalKeywords.slice(0, maxResults)
      : [];

    // Return results
    return res.status(200).json({
      success: true,
      data: {
        localKeywords: finalLocal.map(kw => ({
          keyword: kw.keyword,
          avgMonthlySearches: kw.avgMonthlySearches,
          competition: kw.competition,
          cpc: kw.cpc.toFixed(2),
          score: kw.score,
        })),
        generalKeywords: finalGeneral.map(kw => ({
          keyword: kw.keyword,
          avgMonthlySearches: kw.avgMonthlySearches,
          competition: kw.competition,
          cpc: kw.cpc.toFixed(2),
          score: kw.score,
        })),
      },
      meta: {
        totalLocalKeywords: finalLocal.length,
        totalGeneralKeywords: finalGeneral.length,
        geoTargetUsed: geoTargetId,
        seedKeywordsUsed: seeds,
      }
    });

  } catch (error) {
    console.error('API Error:', error);

    // Return user-friendly error
    return res.status(500).json({
      success: false,
      error: 'Failed to generate keywords',
      message: error.message,

      // For development debugging (remove in production)
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};
