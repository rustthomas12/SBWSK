/**
 * Website Speed Check API
 * Vercel Serverless Function
 * Uses Google PageSpeed Insights API to analyze website performance
 */

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get URL from query parameters
    const url = req.query.url || req.body?.url;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validate URL format
    let testUrl;
    try {
      testUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Helper function to fetch PageSpeed data for a specific strategy
    const fetchPageSpeedData = async (strategy) => {
      let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=${strategy}`;

      // Add API key if configured
      if (process.env.GOOGLE_PAGESPEED_API_KEY) {
        apiUrl += `&key=${process.env.GOOGLE_PAGESPEED_API_KEY}`;
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status}`);
      }

      return await response.json();
    };

    // Fetch both mobile and desktop data in parallel
    const [mobileData, desktopData] = await Promise.all([
      fetchPageSpeedData('mobile'),
      fetchPageSpeedData('desktop')
    ]);

    // Helper function to extract metrics from PageSpeed data
    const extractMetrics = (data) => {
      const lighthouseResult = data.lighthouseResult;
      const categories = lighthouseResult.categories;
      const audits = lighthouseResult.audits;

      // Debug logging
      console.log('Lighthouse Version:', lighthouseResult?.lighthouseVersion);
      console.log('Raw Performance Score:', categories.performance?.score);
      console.log('Calculated Score:', Math.round((categories.performance?.score || 0) * 100));
      console.log('Form Factor:', lighthouseResult?.configSettings?.formFactor);

      return {
        performanceScore: Math.round((categories.performance?.score || 0) * 100),
        metrics: {
          firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
          largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
          totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
          speedIndex: audits['speed-index']?.displayValue || 'N/A',
          timeToInteractive: audits['interactive']?.displayValue || 'N/A',
        }
      };
    };

    // Extract metrics for both mobile and desktop
    const mobileMetrics = extractMetrics(mobileData);
    const desktopMetrics = extractMetrics(desktopData);

    // Use mobile audits for opportunities and diagnostics (they're typically similar)
    const audits = mobileData.lighthouseResult.audits;
    const opportunities = [];
    const diagnostics = [];

    // Extract top opportunities for improvement
    Object.keys(audits).forEach(auditKey => {
      const audit = audits[auditKey];
      if (audit.details && audit.details.type === 'opportunity' && audit.score !== null && audit.score < 1) {
        opportunities.push({
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue,
          score: audit.score
        });
      }
    });

    // Sort by potential impact (lowest score = highest impact)
    opportunities.sort((a, b) => a.score - b.score);
    const topOpportunities = opportunities.slice(0, 5); // Top 5 opportunities

    // Extract key diagnostics
    const diagnosticKeys = [
      'render-blocking-resources',
      'unminified-css',
      'unminified-javascript',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images'
    ];

    diagnosticKeys.forEach(key => {
      const audit = audits[key];
      if (audit && audit.score !== null && audit.score < 1) {
        diagnostics.push({
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue
        });
      }
    });

    // Return formatted results with both mobile and desktop metrics
    return res.status(200).json({
      success: true,
      url: url,
      mobile: mobileMetrics,
      desktop: desktopMetrics,
      opportunities: topOpportunities,
      diagnostics: diagnostics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Speed check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze website speed. Please try again later.',
      details: error.message
    });
  }
};
