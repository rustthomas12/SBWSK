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
                    <p style="color: #6b7280; font-size: 0.875rem;">This may take 20-30 seconds</p>
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

                // Extract key metrics from backend response
                const performanceScore = data.metrics.performanceScore;
                const fcpValue = data.metrics.metrics.firstContentfulPaint;
                const lcpValue = data.metrics.metrics.largestContentfulPaint;
                const ttiValue = data.metrics.metrics.timeToInteractive;
                const clsValue = data.metrics.metrics.cumulativeLayoutShift;
                const tbtValue = data.metrics.metrics.totalBlockingTime;

                // Determine score color
                const getScoreColor = (score) => {
                    if (score >= 90) return { bg: '#ecfdf5', border: '#10b981', text: '#059669' };
                    if (score >= 50) return { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' };
                    return { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' };
                };

                const scoreColors = getScoreColor(performanceScore);
                const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;

                // Display results
                speedResults.innerHTML = `
                    <div style="background: ${scoreColors.bg}; border: 2px solid ${scoreColors.border}; border-radius: 8px; padding: 1.5rem;">
                        <div style="text-align: center; margin-bottom: 1.5rem;">
                            <div style="font-size: 3rem; font-weight: bold; color: ${scoreColors.text}; margin-bottom: 0.5rem;">
                                ${performanceScore}
                            </div>
                            <h4 style="color: ${scoreColors.text}; margin-bottom: 0.5rem;">Performance Score</h4>
                            <p style="color: #6b7280; font-size: 0.875rem;">Mobile Analysis for ${url}</p>
                        </div>

                        <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                            <div style="background: white; padding: 1rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 0.25rem;">First Contentful Paint</div>
                                        <div style="color: #6b7280; font-size: 0.875rem;">Time until first content appears</div>
                                    </div>
                                    <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">${fcpValue}</div>
                                </div>
                            </div>

                            <div style="background: white; padding: 1rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Largest Contentful Paint</div>
                                        <div style="color: #6b7280; font-size: 0.875rem;">Time until largest content is visible</div>
                                    </div>
                                    <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">${lcpValue}</div>
                                </div>
                            </div>

                            <div style="background: white; padding: 1rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Time to Interactive</div>
                                        <div style="color: #6b7280; font-size: 0.875rem;">Time until fully interactive</div>
                                    </div>
                                    <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">${ttiValue}</div>
                                </div>
                            </div>

                            <div style="background: white; padding: 1rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Cumulative Layout Shift</div>
                                        <div style="color: #6b7280; font-size: 0.875rem;">Visual stability measure</div>
                                    </div>
                                    <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">${clsValue}</div>
                                </div>
                            </div>

                            <div style="background: white; padding: 1rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Total Blocking Time</div>
                                        <div style="color: #6b7280; font-size: 0.875rem;">Main thread blocking time</div>
                                    </div>
                                    <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">${tbtValue}</div>
                                </div>
                            </div>
                        </div>

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
