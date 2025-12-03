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
      let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=${strategy}`;

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

      // Count image issues
      const imageIssues = [];
      if (audits['modern-image-formats']?.score < 1) {
        imageIssues.push({ type: 'Old formats', count: audits['modern-image-formats']?.details?.items?.length || 0 });
      }
      if (audits['uses-optimized-images']?.score < 1) {
        imageIssues.push({ type: 'Unoptimized', count: audits['uses-optimized-images']?.details?.items?.length || 0 });
      }
      if (audits['uses-responsive-images']?.score < 1) {
        imageIssues.push({ type: 'Non-responsive', count: audits['uses-responsive-images']?.details?.items?.length || 0 });
      }

      // Count accessibility issues
      const missingAltText = audits['image-alt']?.score < 1 ? (audits['image-alt']?.details?.items?.length || 0) : 0;
      const missingH1s = audits['heading-order']?.score < 1 || audits['document-title']?.score < 1;

      // SEO structure issues
      const seoScore = Math.round((categories.seo?.score || 0) * 100);
      const seoIssues = [];
      if (audits['meta-description']?.score < 1) seoIssues.push('Missing meta description');
      if (audits['document-title']?.score < 1) seoIssues.push('Missing page title');
      if (audits['heading-order']?.score < 1) seoIssues.push('Heading structure issues');
      if (audits['crawlable-anchors']?.score < 1) seoIssues.push('Uncrawlable links');
      if (audits['link-text']?.score < 1) seoIssues.push('Generic link text');

      return {
        performanceScore: Math.round((categories.performance?.score || 0) * 100),
        seoScore: seoScore,
        accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
        bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
        metrics: {
          firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
          largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
          totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
          speedIndex: audits['speed-index']?.displayValue || 'N/A',
          timeToInteractive: audits['interactive']?.displayValue || 'N/A',
        },
        issues: {
          imageIssues: imageIssues,
          totalImageIssues: imageIssues.reduce((sum, issue) => sum + issue.count, 0),
          missingAltText: missingAltText,
          missingH1s: missingH1s,
          seoIssues: seoIssues,
          mobileOptimized: audits['viewport']?.score === 1,
          hasMetaViewport: audits['viewport']?.score === 1
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
