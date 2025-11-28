// Website Speed Check functionality

document.addEventListener('DOMContentLoaded', () => {
    const speedTestForm = document.getElementById('speedTestForm');
    const speedResults = document.getElementById('speedResults');
    const websiteUrlInput = document.getElementById('websiteUrl');

    if (speedTestForm) {
        speedTestForm.addEventListener('submit', (e) => {
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
                    <p>Redirecting to Google PageSpeed Insights...</p>
                </div>
            `;
            speedResults.classList.remove('hidden');

            // Redirect to Google PageSpeed Insights with the URL
            setTimeout(() => {
                const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;
                window.open(pageSpeedUrl, '_blank', 'noopener,noreferrer');

                // Show success message
                speedResults.innerHTML = `
                    <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 1.5rem; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">✅</div>
                        <h4 style="color: #059669; margin-bottom: 0.5rem;">Test Launched!</h4>
                        <p style="color: #065f46; margin-bottom: 1rem;">
                            Google PageSpeed Insights has opened in a new tab to analyze <strong>${url}</strong>
                        </p>
                        <p style="color: #065f46; font-size: 0.875rem; margin-bottom: 1rem;">
                            If it didn't open, click the button below:
                        </p>
                        <a href="${pageSpeedUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                            Open PageSpeed Insights
                        </a>
                        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #d1fae5;">
                        <h5 style="margin-bottom: 0.5rem;">💡 What to Look For:</h5>
                        <ul style="text-align: left; color: #065f46; font-size: 0.875rem; line-height: 1.8; max-width: 500px; margin: 0 auto;">
                            <li>Performance score (aim for 90+)</li>
                            <li>Core Web Vitals (LCP, FID, CLS)</li>
                            <li>Mobile vs Desktop performance</li>
                            <li>Opportunities for improvement</li>
                            <li>Diagnostics and recommendations</li>
                        </ul>
                    </div>
                `;
            }, 1000);
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
