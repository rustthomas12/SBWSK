// Website Speed Check functionality

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
                <div style="text-align: center; padding: 2rem;">
                    <div class="spinner" style="margin: 0 auto 1rem;"></div>
                    <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Analyzing website performance...</p>
                    <p style="color: #6b7280; font-size: 0.875rem;">Testing both mobile and desktop • This may take 30-45 seconds</p>
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

                // Extract metrics for both mobile and desktop
                const mobileScore = data.mobile.performanceScore;
                const desktopScore = data.desktop.performanceScore;
                const mobileMetrics = data.mobile.metrics;
                const desktopMetrics = data.desktop.metrics;

                // Determine score color
                const getScoreColor = (score) => {
                    if (score >= 90) return { bg: '#ecfdf5', border: '#10b981', text: '#059669' };
                    if (score >= 50) return { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' };
                    return { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' };
                };

                const mobileColors = getScoreColor(mobileScore);
                const desktopColors = getScoreColor(desktopScore);
                const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;

                // Display results with both mobile and desktop scores
                speedResults.innerHTML = `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="text-align: center; margin-bottom: 1rem; color: #374151;">Performance Scores for ${url}</h4>

                        <!-- Mobile and Desktop Scores Side by Side -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                            <!-- Mobile Score -->
                            <div style="background: ${mobileColors.bg}; border: 2px solid ${mobileColors.border}; border-radius: 8px; padding: 1.5rem; text-align: center;">
                                <div style="font-size: 2.5rem; font-weight: bold; color: ${mobileColors.text}; margin-bottom: 0.5rem;">
                                    ${mobileScore}
                                </div>
                                <h5 style="color: ${mobileColors.text}; margin: 0;">📱 Mobile</h5>
                            </div>

                            <!-- Desktop Score -->
                            <div style="background: ${desktopColors.bg}; border: 2px solid ${desktopColors.border}; border-radius: 8px; padding: 1.5rem; text-align: center;">
                                <div style="font-size: 2.5rem; font-weight: bold; color: ${desktopColors.text}; margin-bottom: 0.5rem;">
                                    ${desktopScore}
                                </div>
                                <h5 style="color: ${desktopColors.text}; margin: 0;">💻 Desktop</h5>
                            </div>
                        </div>

                        <!-- Metrics Comparison -->
                        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem;">
                            <h5 style="margin-bottom: 1rem; color: #374151;">Performance Metrics Comparison</h5>
                            <div style="display: grid; gap: 0.75rem;">
                                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; padding: 0.75rem; background: #f9fafb; border-radius: 6px; align-items: center;">
                                    <div style="font-weight: 600; color: #374151;">Metric</div>
                                    <div style="font-weight: 600; color: #374151; text-align: center;">📱 Mobile</div>
                                    <div style="font-weight: 600; color: #374151; text-align: center;">💻 Desktop</div>
                                </div>

                                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.875rem;">First Contentful Paint</div>
                                        <div style="color: #6b7280; font-size: 0.75rem;">Time until first content</div>
                                    </div>
                                    <div style="font-weight: bold; color: var(--primary); text-align: center;">${mobileMetrics.firstContentfulPaint}</div>
                                    <div style="font-weight: bold; color: var(--primary); text-align: center;">${desktopMetrics.firstContentfulPaint}</div>
                                </div>

                                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.875rem;">Largest Contentful Paint</div>
                                        <div style="color: #6b7280; font-size: 0.75rem;">Largest content visible</div>
                                    </div>
                                    <div style="font-weight: bold; color: var(--primary); text-align: center;">${mobileMetrics.largestContentfulPaint}</div>
                                    <div style="font-weight: bold; color: var(--primary); text-align: center;">${desktopMetrics.largestContentfulPaint}</div>
                                </div>

                                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.875rem;">Time to Interactive</div>
                                        <div style="color: #6b7280; font-size: 0.75rem;">Fully interactive</div>
                                    </div>
                                    <div style="font-weight: bold; color: var(--primary); text-align: center;">${mobileMetrics.timeToInteractive}</div>
                                    <div style="font-weight: bold; color: var(--primary); text-align: center;">${desktopMetrics.timeToInteractive}</div>
                                </div>

                                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.875rem;">Cumulative Layout Shift</div>
                                        <div style="color: #6b7280; font-size: 0.75rem;">Visual stability</div>
                                    </div>
                                    <div style="font-weight: bold; color: var(--primary); text-align: center;">${mobileMetrics.cumulativeLayoutShift}</div>
                                    <div style="font-weight: bold; color: var(--primary); text-align: center;">${desktopMetrics.cumulativeLayoutShift}</div>
                                </div>

                                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; padding: 0.75rem; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.875rem;">Total Blocking Time</div>
                                        <div style="color: #6b7280; font-size: 0.75rem;">Main thread blocking</div>
                                    </div>
                                    <div style="font-weight: bold; color: var(--primary); text-align: center;">${mobileMetrics.totalBlockingTime}</div>
                                    <div style="font-weight: bold; color: var(--primary); text-align: center;">${desktopMetrics.totalBlockingTime}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem;">

                        <div style="text-align: center; padding-top: 1rem; border-top: 2px solid rgba(0,0,0,0.1);">
                            <a href="${pageSpeedUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                                View Detailed Report →
                            </a>
                            <button onclick="document.getElementById('speedResults').classList.add('hidden')" class="btn" style="margin-left: 0.5rem; background: #f3f4f6;">
                                Run Another Test
                            </button>
                        </div>
                    </div>
                `;
            } catch (error) {
                // Show error with fallback to redirect option
                const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;
                speedResults.innerHTML = `
                    <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 1.5rem; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">⚠️</div>
                        <h4 style="color: #d97706; margin-bottom: 0.5rem;">Unable to Fetch Results</h4>
                        <p style="color: #92400e; margin-bottom: 1rem;">
                            We couldn't analyze the website automatically. This might be due to API rate limits or an invalid URL.
                        </p>
                        <p style="color: #92400e; margin-bottom: 1.5rem;">
                            Click below to analyze <strong>${url}</strong> directly on Google PageSpeed Insights:
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

// Add spinner CSS if not already in main CSS
const style = document.createElement('style');
style.textContent = `
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
