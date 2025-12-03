// Enhanced Website Speed Check with All 6 Key Metrics
// This replaces the basic speed check functionality

document.addEventListener('DOMContentLoaded', () => {
    const speedTestForm = document.getElementById('speedTestForm');
    const speedResults = document.getElementById('speedResults');
    const websiteUrlInput = document.getElementById('websiteUrl');

    if (speedTestForm) {
        speedTestForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let url = websiteUrlInput.value.trim();

            // Validate URL
            if (!url) {
                alert('Please enter a website URL');
                return;
            }

            // Add https:// if no protocol specified
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            // Validate URL format
            try {
                new URL(url);
            } catch (error) {
                alert('Please enter a valid URL (e.g., https://example.com)');
                return;
            }

            // Show loading state
            speedResults.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div class="spinner" style="margin: 0 auto 1.5rem;"></div>
                    <h3 style="margin-bottom: 0.5rem;">Analyzing Your Website...</h3>
                    <p style="color: #6b7280; font-size: 1rem; margin-bottom: 1rem;">Running comprehensive performance audit</p>
                    <p style="color: #6b7280; font-size: 0.875rem;">✓ Performance Score<br>✓ Mobile Optimization<br>✓ Image Analysis<br>✓ SEO Structure<br>✓ Accessibility Check</p>
                    <p style="color: #9ca3af; font-size: 0.75rem; margin-top: 1rem;">This may take 30-45 seconds</p>
                </div>
            `;
            speedResults.classList.remove('hidden');

            try {
                // Use backend API to analyze the URL
                const apiUrl = `/api/check-speed?url=${encodeURIComponent(url)}`;
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error('Failed to analyze website');
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to analyze website');
                }

                // Display comprehensive results
                displayEnhancedResults(url, data);

            } catch (error) {
                // Show error with fallback
                const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;
                speedResults.innerHTML = `
                    <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 2rem; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                        <h4 style="color: #d97706; margin-bottom: 0.5rem;">Unable to Fetch Results</h4>
                        <p style="color: #92400e; margin-bottom: 1.5rem;">
                            We couldn't analyze the website automatically. Click below to analyze on Google PageSpeed Insights:
                        </p>
                        <a href="${pageSpeedUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                            Open PageSpeed Insights →
                        </a>
                        <button onclick="document.getElementById('speedResults').classList.add('hidden')" class="btn" style="margin-left: 0.5rem; background: #f3f4f6;">
                            Try Another URL
                        </button>
                    </div>
                `;
            }
        });
    }
});

function displayEnhancedResults(url, data) {
    const speedResults = document.getElementById('speedResults');
    const mobile = data.mobile;
    const desktop = data.desktop;
    const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;

    // Helper functions
    const getScoreColor = (score) => {
        if (score >= 90) return { bg: '#ecfdf5', border: '#10b981', text: '#059669', label: 'Excellent' };
        if (score >= 50) return { bg: '#fef3c7', border: '#f59e0b', text: '#d97706', label: 'Needs Work' };
        return { bg: '#fee2e2', border: '#ef4444', text: '#dc2626', label: 'Poor' };
    };

    const getStatusIcon = (isGood) => isGood ? '✅' : '❌';
    const getStatusColor = (isGood) => isGood ? '#10b981' : '#ef4444';

    const perfColors = getScoreColor(mobile.performanceScore);
    const seoColors = getScoreColor(mobile.seoScore);

    speedResults.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb;">
                <h3 style="margin-bottom: 0.5rem; color: #111827;">Website Analysis Report</h3>
                <p style="color: #6b7280; font-size: 0.875rem; margin: 0;">${url}</p>
            </div>

            <!-- What We Check Section -->
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: white;">🔍 What We Check</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
                    <div style="background: rgba(255,255,255,0.15); padding: 0.75rem; border-radius: 6px;">
                        <strong>⚡ Performance Score</strong><br>
                        <span style="font-size: 0.875rem; opacity: 0.95;">Overall speed & loading time</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 0.75rem; border-radius: 6px;">
                        <strong>📱 Mobile Optimization</strong><br>
                        <span style="font-size: 0.875rem; opacity: 0.95;">Responsive & mobile-friendly</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 0.75rem; border-radius: 6px;">
                        <strong>🖼️ Image Issues</strong><br>
                        <span style="font-size: 0.875rem; opacity: 0.95;">Size, format, optimization</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 0.75rem; border-radius: 6px;">
                        <strong>🏷️ Missing Alt Text</strong><br>
                        <span style="font-size: 0.875rem; opacity: 0.95;">Accessibility & SEO</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 0.75rem; border-radius: 6px;">
                        <strong>📝 Missing H1s</strong><br>
                        <span style="font-size: 0.875rem; opacity: 0.95;">Proper heading structure</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 0.75rem; border-radius: 6px;">
                        <strong>🔍 SEO Structure</strong><br>
                        <span style="font-size: 0.875rem; opacity: 0.95;">Meta tags, titles, links</span>
                    </div>
                </div>
            </div>

            <!-- Key Metrics Dashboard -->
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1.5rem; color: #111827; text-align: center;">📊 Key Metrics Dashboard</h4>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <!-- Performance Score -->
                    <div style="background: ${perfColors.bg}; border: 2px solid ${perfColors.border}; border-radius: 8px; padding: 1.5rem; text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: ${perfColors.text}; margin-bottom: 0.25rem;">
                            ${mobile.performanceScore}
                        </div>
                        <div style="font-size: 0.875rem; color: ${perfColors.text}; font-weight: 600; margin-bottom: 0.5rem;">
                            ${perfColors.label}
                        </div>
                        <h5 style="color: ${perfColors.text}; margin: 0;">⚡ Performance Score</h5>
                        <p style="font-size: 0.75rem; color: ${perfColors.text}; margin-top: 0.5rem; opacity: 0.8;">Mobile Speed</p>
                    </div>

                    <!-- Mobile Optimization -->
                    <div style="background: ${mobile.issues.mobileOptimized ? '#ecfdf5' : '#fee2e2'}; border: 2px solid ${mobile.issues.mobileOptimized ? '#10b981' : '#ef4444'}; border-radius: 8px; padding: 1.5rem; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">
                            ${mobile.issues.mobileOptimized ? '✅' : '❌'}
                        </div>
                        <h5 style="color: ${mobile.issues.mobileOptimized ? '#059669' : '#dc2626'}; margin: 0;">📱 Mobile Optimized</h5>
                        <p style="font-size: 0.75rem; color: ${mobile.issues.mobileOptimized ? '#059669' : '#dc2626'}; margin-top: 0.5rem;">
                            ${mobile.issues.mobileOptimized ? 'Responsive viewport configured' : 'Not mobile-friendly'}
                        </p>
                    </div>

                    <!-- SEO Score -->
                    <div style="background: ${seoColors.bg}; border: 2px solid ${seoColors.border}; border-radius: 8px; padding: 1.5rem; text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: ${seoColors.text}; margin-bottom: 0.25rem;">
                            ${mobile.seoScore}
                        </div>
                        <div style="font-size: 0.875rem; color: ${seoColors.text}; font-weight: 600; margin-bottom: 0.5rem;">
                            ${seoColors.label}
                        </div>
                        <h5 style="color: ${seoColors.text}; margin: 0;">🔍 SEO Score</h5>
                        <p style="font-size: 0.75rem; color: ${seoColors.text}; margin-top: 0.5rem; opacity: 0.8;">Search Engine Optimization</p>
                    </div>
                </div>

                <!-- Issues Found -->
                <div style="background: #f9fafb; padding: 1.5rem; border-radius: 8px;">
                    <h5 style="margin-bottom: 1rem; color: #374151;">🔧 Issues Found</h5>
                    <div style="display: grid; gap: 0.75rem;">

                        <!-- Image Issues -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border-left: 4px solid ${mobile.issues.totalImageIssues > 0 ? '#ef4444' : '#10b981'};">
                            <div>
                                <strong style="color: #111827;">🖼️ Image Issues</strong>
                                <p style="font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0 0 0;">
                                    ${mobile.issues.totalImageIssues > 0 ? `${mobile.issues.totalImageIssues} images need optimization` : 'All images optimized'}
                                </p>
                            </div>
                            <div style="font-size: 1.5rem;">
                                ${mobile.issues.totalImageIssues > 0 ? '⚠️' : '✅'}
                            </div>
                        </div>

                        <!-- Missing Alt Text -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border-left: 4px solid ${mobile.issues.missingAltText > 0 ? '#ef4444' : '#10b981'};">
                            <div>
                                <strong style="color: #111827;">🏷️ Missing Alt Text</strong>
                                <p style="font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0 0 0;">
                                    ${mobile.issues.missingAltText > 0 ? `${mobile.issues.missingAltText} images missing alt text` : 'All images have alt text'}
                                </p>
                            </div>
                            <div style="font-size: 1.5rem;">
                                ${mobile.issues.missingAltText > 0 ? '⚠️' : '✅'}
                            </div>
                        </div>

                        <!-- Missing H1s/Heading Structure -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border-left: 4px solid ${mobile.issues.missingH1s ? '#ef4444' : '#10b981'};">
                            <div>
                                <strong style="color: #111827;">📝 Heading Structure</strong>
                                <p style="font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0 0 0;">
                                    ${mobile.issues.missingH1s ? 'Heading order or H1 issues detected' : 'Proper heading structure'}
                                </p>
                            </div>
                            <div style="font-size: 1.5rem;">
                                ${mobile.issues.missingH1s ? '⚠️' : '✅'}
                            </div>
                        </div>

                        <!-- SEO Structure -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border-left: 4px solid ${mobile.issues.seoIssues.length > 0 ? '#ef4444' : '#10b981'};">
                            <div>
                                <strong style="color: #111827;">🔍 SEO Structure</strong>
                                <p style="font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0 0 0;">
                                    ${mobile.issues.seoIssues.length > 0 ? mobile.issues.seoIssues.join(', ') : 'SEO structure is good'}
                                </p>
                            </div>
                            <div style="font-size: 1.5rem;">
                                ${mobile.issues.seoIssues.length > 0 ? '⚠️' : '✅'}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Performance Metrics Detail -->
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
                <h5 style="margin-bottom: 1rem; color: #374151;">⏱️ Performance Metrics</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: #f9fafb; border-radius: 6px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #0ea5e9; margin-bottom: 0.25rem;">
                            ${mobile.metrics.firstContentfulPaint}
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280;">First Paint</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f9fafb; border-radius: 6px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #0ea5e9; margin-bottom: 0.25rem;">
                            ${mobile.metrics.largestContentfulPaint}
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Largest Paint</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f9fafb; border-radius: 6px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #0ea5e9; margin-bottom: 0.25rem;">
                            ${mobile.metrics.timeToInteractive}
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Interactive</div>
                    </div>
                </div>
            </div>

            <!-- CTA Section -->
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 2rem; border-radius: 12px; color: white; text-align: center;">
                <h4 style="color: white; margin-bottom: 0.5rem;">Need Help Fixing These Issues?</h4>
                <p style="opacity: 0.95; margin-bottom: 1.5rem;">Our Speed Optimization Service can fix all these issues and boost your performance by 50%+</p>
                <button onclick="handleSpeedCheckout()" class="btn btn-large" style="background: white; color: #d97706; border: none;">
                    Get Speed Optimization - $147 →
                </button>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
                <a href="${pageSpeedUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                    View Full PageSpeed Report →
                </a>
                <button onclick="document.getElementById('speedResults').classList.add('hidden'); document.getElementById('websiteUrl').value = '';" class="btn" style="margin-left: 0.5rem; background: #f3f4f6;">
                    Test Another Website
                </button>
            </div>
        </div>
    `;
}

// Add spinner CSS if not already in main CSS
const style = document.createElement('style');
style.textContent = `
    .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f4f6;
        border-top: 5px solid var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
