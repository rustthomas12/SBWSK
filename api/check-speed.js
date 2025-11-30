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

    // Call Google PageSpeed Insights API
    // Using API key if available, otherwise use public API (has rate limits)
    // Get free API key from: https://console.cloud.google.com/apis/credentials
    let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=mobile`;

    // Add API key if configured
    if (process.env.GOOGLE_PAGESPEED_API_KEY) {
      apiUrl += `&key=${process.env.GOOGLE_PAGESPEED_API_KEY}`;
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract key metrics
    const lighthouseResult = data.lighthouseResult;
    const categories = lighthouseResult.categories;
    const audits = lighthouseResult.audits;

    // Get performance metrics
    const metrics = {
      performanceScore: Math.round((categories.performance?.score || 0) * 100),
      metrics: {
        firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
        largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
        totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
        speedIndex: audits['speed-index']?.displayValue || 'N/A',
        timeToInteractive: audits['interactive']?.displayValue || 'N/A',
      },
      opportunities: [],
      diagnostics: []
    };

    // Extract top opportunities for improvement
    Object.keys(audits).forEach(auditKey => {
      const audit = audits[auditKey];
      if (audit.details && audit.details.type === 'opportunity' && audit.score !== null && audit.score < 1) {
        metrics.opportunities.push({
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue,
          score: audit.score
        });
      }
    });

    // Sort by potential impact (lowest score = highest impact)
    metrics.opportunities.sort((a, b) => a.score - b.score);
    metrics.opportunities = metrics.opportunities.slice(0, 5); // Top 5 opportunities

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
        metrics.diagnostics.push({
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue
        });
      }
    });

    // Return formatted results
    return res.status(200).json({
      success: true,
      url: url,
      metrics: metrics,
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
