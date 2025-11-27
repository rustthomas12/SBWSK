/**
 * Website Quote Estimator
 * Interactive quiz to calculate website project cost
 */

let currentStep = 1;
const totalSteps = 5;
const quoteData = {};

document.addEventListener('DOMContentLoaded', () => {
    initializeQuiz();
});

/**
 * Initialize quiz functionality
 */
function initializeQuiz() {
    // Add click handlers to option cards
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
            const input = card.querySelector('input');

            if (input.type === 'radio') {
                // Deselect all other cards in the same group
                const groupName = input.name;
                document.querySelectorAll(`input[name="${groupName}"]`).forEach(radio => {
                    radio.closest('.option-card').classList.remove('selected');
                });
                card.classList.add('selected');
                input.checked = true;
            } else if (input.type === 'checkbox') {
                // Toggle checkbox
                input.checked = !input.checked;
                card.classList.toggle('selected', input.checked);
            }
        });
    });

    updateProgress();
}

/**
 * Move to next step
 */
function nextStep() {
    const currentStepElement = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);

    // Validate current step
    if (!validateStep(currentStep)) {
        showAlert('Please make a selection to continue', 'warning', 'quizContainer');
        return;
    }

    // Save data from current step
    saveStepData(currentStep);

    // Hide current step
    currentStepElement.classList.remove('active');

    // Show next step
    currentStep++;
    const nextStepElement = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
    nextStepElement.classList.add('active');

    // Update progress
    updateProgress();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Move to previous step
 */
function prevStep() {
    const currentStepElement = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);

    // Hide current step
    currentStepElement.classList.remove('active');

    // Show previous step
    currentStep--;
    const prevStepElement = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
    prevStepElement.classList.add('active');

    // Update progress
    updateProgress();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Validate current step has required selections
 */
function validateStep(step) {
    const stepElement = document.querySelector(`.quiz-step[data-step="${step}"]`);

    // Check for required radio buttons
    const radioGroups = stepElement.querySelectorAll('input[type="radio"][required]');
    if (radioGroups.length > 0) {
        const groupName = radioGroups[0].name;
        const checked = stepElement.querySelector(`input[name="${groupName}"]:checked`);
        if (!checked) return false;
    }

    return true;
}

/**
 * Save data from current step
 */
function saveStepData(step) {
    const stepElement = document.querySelector(`.quiz-step[data-step="${step}"]`);

    // Save radio button selections
    stepElement.querySelectorAll('input[type="radio"]:checked').forEach(input => {
        quoteData[input.name] = input.value;
    });

    // Save checkbox selections
    const checkboxes = stepElement.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length > 0) {
        const groupName = checkboxes[0].name;
        quoteData[groupName] = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }
}

/**
 * Update progress bar and text
 */
function updateProgress() {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Step ${currentStep} of ${totalSteps - 1}`;
}

/**
 * Calculate and display quote
 */
function calculateQuote() {
    // Validate final step
    if (!validateStep(currentStep)) {
        showAlert('Please select a design level', 'warning', 'quizContainer');
        return;
    }

    // Save final step data
    saveStepData(currentStep);

    // Calculate pricing
    const pricing = calculatePricing(quoteData);

    // Display results
    displayQuoteResults(pricing);

    // Move to results step
    const currentStepElement = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
    currentStepElement.classList.remove('active');

    currentStep = 5;
    const resultsStep = document.querySelector(`.quiz-step[data-step="5"]`);
    resultsStep.style.display = 'block';
    resultsStep.classList.add('active');

    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Calculate pricing based on selections
 * @param {Object} data - Quote data from user selections
 * @returns {Object} - Pricing breakdown
 */
function calculatePricing(data) {
    let basePrice = 0;
    let breakdown = [];

    // Base price by page count
    const pageRanges = {
        '1-3': { price: 500, label: '1-3 Pages' },
        '4-6': { price: 900, label: '4-6 Pages' },
        '7-10': { price: 1400, label: '7-10 Pages' },
        '10+': { price: 2000, label: '10+ Pages' }
    };

    const pageInfo = pageRanges[data.pageCount];
    basePrice += pageInfo.price;
    breakdown.push({ item: pageInfo.label, price: pageInfo.price });

    // Design level multiplier
    const designMultipliers = {
        'basic': { multiplier: 1.0, label: 'Basic Template Design' },
        'custom': { multiplier: 1.5, label: 'Custom Design' },
        'premium': { multiplier: 2.2, label: 'Premium Custom Design' }
    };

    const designInfo = designMultipliers[data.designLevel];
    const designCost = basePrice * (designInfo.multiplier - 1);
    if (designCost > 0) {
        breakdown.push({ item: designInfo.label, price: designCost });
    }
    basePrice *= designInfo.multiplier;

    // Feature add-ons
    const featurePrices = {
        'blog': { price: 200, label: 'Blog Setup' },
        'booking': { price: 400, label: 'Online Booking System' },
        'gallery': { price: 150, label: 'Photo Gallery' },
        'ecommerce': { price: 800, label: 'E-commerce Store' },
        'payments': { price: 300, label: 'Payment Processing' },
        'forms': { price: 100, label: 'Custom Forms' }
    };

    let featuresTotal = 0;
    if (data.features && data.features.length > 0) {
        data.features.forEach(feature => {
            const featureInfo = featurePrices[feature];
            featuresTotal += featureInfo.price;
            breakdown.push({ item: featureInfo.label, price: featureInfo.price });
        });
    }

    const totalLow = Math.round(basePrice + featuresTotal);
    const totalHigh = Math.round(totalLow * 1.25); // 25% range

    return {
        totalLow,
        totalHigh,
        breakdown,
        businessType: data.businessType,
        designLevel: data.designLevel
    };
}

/**
 * Display quote results
 */
function displayQuoteResults(pricing) {
    const resultsContainer = document.getElementById('quoteResults');

    const html = `
        <div class="text-center" style="margin-bottom: 2rem;">
            <h3 style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 0.5rem;">
                Your Estimated Website Cost
            </h3>
            <div style="font-size: 3rem; font-weight: 800; color: var(--primary-color); line-height: 1;">
                ${formatCurrency(pricing.totalLow)} - ${formatCurrency(pricing.totalHigh)}
            </div>
            <p class="text-muted" style="margin-top: 0.5rem;">
                Based on your selections
            </p>
        </div>

        <div style="background-color: var(--bg-secondary); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">What's Included:</h4>
            <ul style="list-style: none; padding: 0;">
                ${pricing.breakdown.map(item => `
                    <li style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                        <span>${item.item}</span>
                        <span style="font-weight: 600;">${formatCurrency(item.price)}</span>
                    </li>
                `).join('')}
            </ul>
        </div>

        <div class="alert alert-info" style="margin-bottom: 2rem;">
            <strong>Always Included:</strong> Mobile-responsive design, SEO basics, contact forms, social media integration, and 30 days of post-launch support.
        </div>

        <div style="background-color: #f0fdf4; padding: 1.5rem; border-radius: var(--radius-lg); border: 2px solid var(--secondary-color); margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">💰 Don't Forget Hosting!</h4>
            <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                Save up to 60% on website hosting with our recommended partner. Includes free domain, SSL certificate, and 24/7 support.
            </p>
            <a href="https://bluehost.sjv.io/Webstarterkit" target="_blank" rel="noopener" class="btn btn-secondary btn-block" onclick="trackAffiliateClick('quote-results-hosting')">
                Get Hosting - Save 60% →
            </a>
        </div>

        <h4 style="margin-bottom: 1rem;">Ready to Get Started?</h4>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
            Fill out the form below and we'll get back to you within 24 hours with a detailed proposal.
        </p>

        <form id="quoteLeadForm" style="background-color: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div id="leadFormAlert"></div>

            <div class="form-row">
                <div class="form-group">
                    <label for="leadName">Your Name *</label>
                    <input type="text" id="leadName" name="name" required>
                </div>
                <div class="form-group">
                    <label for="leadEmail">Email Address *</label>
                    <input type="email" id="leadEmail" name="email" required>
                </div>
            </div>

            <div class="form-group">
                <label for="leadPhone">Phone Number</label>
                <input type="tel" id="leadPhone" name="phone">
            </div>

            <div class="form-group">
                <label for="leadBusiness">Business Name</label>
                <input type="text" id="leadBusiness" name="business">
            </div>

            <div class="form-group">
                <label for="leadMessage">Tell us more about your project</label>
                <textarea id="leadMessage" name="message" rows="4" placeholder="What's your timeline? Any specific features or goals?"></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-large btn-block">
                Send My Quote Request
            </button>

            <p style="font-size: 0.875rem; color: var(--text-secondary); text-align: center; margin-top: 1rem;">
                We respect your privacy. Your information will never be shared.
            </p>
        </form>

        <div style="text-align: center; margin-top: 2rem;">
            <button type="button" class="btn btn-outline" onclick="restartQuiz()">
                ← Start Over
            </button>
        </div>
    `;

    resultsContainer.innerHTML = html;

    // Initialize lead form
    initializeLeadForm(pricing);
}

/**
 * Initialize lead capture form
 */
function initializeLeadForm(pricing) {
    const form = document.getElementById('quoteLeadForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm(form)) {
            return;
        }

        const formData = {
            name: document.getElementById('leadName').value,
            email: document.getElementById('leadEmail').value,
            phone: document.getElementById('leadPhone').value,
            business: document.getElementById('leadBusiness').value,
            message: document.getElementById('leadMessage').value,
            quoteRange: `${formatCurrency(pricing.totalLow)} - ${formatCurrency(pricing.totalHigh)}`,
            quoteData: quoteData,
            timestamp: new Date().toISOString(),
            source: 'quote-estimator'
        };

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Sending...';

        try {
            const response = await submitLead(formData);

            if (response.success) {
                showAlert('Thank you! We\'ll send you a detailed proposal within 24 hours.', 'success', 'leadFormAlert');
                form.reset();

                // Scroll to success message
                setTimeout(() => {
                    document.getElementById('leadFormAlert').scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);

            // Fallback: mailto
            const mailtoLink = `mailto:your-email@example.com?subject=Quote Request from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(
                `Name: ${formData.name}\n` +
                `Email: ${formData.email}\n` +
                `Phone: ${formData.phone}\n` +
                `Business: ${formData.business}\n` +
                `Quote Range: ${formData.quoteRange}\n\n` +
                `Message:\n${formData.message}`
            )}`;

            window.location.href = mailtoLink;
            showAlert('Opening your email client...', 'info', 'leadFormAlert');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

/**
 * Submit lead (defined in app.js but redeclared here for standalone use)
 */
async function submitLead(formData) {
    try {
        const response = await fetch('/.netlify/functions/submit-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed');
        return await response.json();
    } catch (e) {
        try {
            const response = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Failed');
            return await response.json();
        } catch (err) {
            throw err;
        }
    }
}

/**
 * Restart quiz
 */
function restartQuiz() {
    currentStep = 1;
    Object.keys(quoteData).forEach(key => delete quoteData[key]);

    // Reset all selections
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.checked = false;
    });

    // Show first step
    document.querySelectorAll('.quiz-step').forEach(step => {
        step.classList.remove('active');
        step.style.display = '';
    });
    document.querySelector('.quiz-step[data-step="1"]').classList.add('active');

    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
