/**
 * Serverless function to generate complete website copy kit using Google Gemini AI
 * Generates: About, Services, Contact, FAQ, and Privacy/Terms pages
 */

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            businessName,
            businessType,
            location,
            services,
            uniqueValue,
            tone,
            targetAudience,
            yearsInBusiness,
            phoneNumber,
            email,
            website,
            teamSize,
            certifications,
            serviceArea,
            operatingHours,
            emergencyService
        } = req.body;

        // Validate required fields
        if (!businessName || !businessType || !location || !services) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const GEMINI_API_KEY = 'AIzaSyAZwDGA1yE6NL1EV-4kllsTUZEFaywqzt4';

        // Parse services list
        const servicesList = services.split('\n').filter(s => s.trim()).map(s => s.trim());

        // =================================================================
        // GENERATE ABOUT PAGE
        // =================================================================
        const aboutPrompt = `You are a professional copywriter. Generate compelling "About Us" page copy for a ${businessType} business.

Business Details:
- Business Name: ${businessName}
- Business Type: ${businessType}
- Location: ${location}
${uniqueValue ? `- Unique Value: ${uniqueValue}` : ''}
- Target Audience: ${targetAudience}
${yearsInBusiness ? `- Years in Business: ${yearsInBusiness}+` : ''}
${teamSize ? `- Team Size: ${teamSize}` : ''}
${certifications ? `- Certifications: ${certifications}` : ''}
- Tone: ${tone}

Generate an About Us page with these sections:

1. Opening Statement (2-3 sentences introducing the business and what makes it special)
2. Our Story (2-3 paragraphs about the company's history, mission, and values)
3. Why Choose Us (4-6 bullet points highlighting key advantages)
4. Our Team (1-2 paragraphs about the people behind the business)
5. Our Commitment (1 paragraph about promises to customers)

IMPORTANT: Respond with ONLY valid JSON, no markdown:
{
  "openingStatement": "...",
  "ourStory": "...",
  "whyChooseUs": "...",
  "ourTeam": "...",
  "ourCommitment": "..."
}`;

        // =================================================================
        // GENERATE SERVICES PAGE
        // =================================================================
        const servicesPrompt = `You are a professional copywriter. Generate compelling "Services" page copy for a ${businessType} business.

Business Details:
- Business Name: ${businessName}
- Services Offered: ${servicesList.join(', ')}
- Location: ${location}
${uniqueValue ? `- Unique Value: ${uniqueValue}` : ''}
${serviceArea ? `- Service Area: ${serviceArea}` : ''}
${emergencyService === 'yes' ? '- Emergency Services: Available' : ''}
- Tone: ${tone}

For each service, generate:
1. Service Introduction (1-2 sentences overview of all services)
2. Individual Service Descriptions (for each service: name, 2-3 sentences benefit-focused description, 3-4 key features/benefits)
3. Process Overview (4-5 steps showing how you work with customers)
4. Call-to-Action (strong closing paragraph with urgency)

IMPORTANT: Respond with ONLY valid JSON, no markdown:
{
  "serviceIntro": "...",
  "services": [
    {
      "name": "Service Name",
      "description": "...",
      "features": ["feature 1", "feature 2", "feature 3"]
    }
  ],
  "processSteps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."],
  "callToAction": "..."
}`;

        // =================================================================
        // GENERATE CONTACT PAGE
        // =================================================================
        const contactPrompt = `You are a professional copywriter. Generate compelling "Contact Us" page copy for a ${businessType} business.

Business Details:
- Business Name: ${businessName}
- Location: ${location}
${phoneNumber ? `- Phone: ${phoneNumber}` : ''}
${email ? `- Email: ${email}` : ''}
${operatingHours ? `- Hours: ${operatingHours}` : ''}
${emergencyService === 'yes' ? '- Emergency Service: Available 24/7' : ''}
- Tone: ${tone}

Generate:
1. Page Headline (6-10 words, inviting and action-oriented)
2. Opening Paragraph (2-3 sentences encouraging visitors to reach out)
3. Contact Methods Section (brief intro to available contact options)
4. Form Instructions (1-2 sentences guiding users to fill out the contact form)
5. Response Time Promise (1 sentence about when they'll hear back)

IMPORTANT: Respond with ONLY valid JSON, no markdown:
{
  "headline": "...",
  "openingParagraph": "...",
  "contactMethodsIntro": "...",
  "formInstructions": "...",
  "responseTimePromise": "..."
}`;

        // =================================================================
        // GENERATE FAQ PAGE
        // =================================================================
        const faqPrompt = `You are a professional copywriter. Generate a comprehensive FAQ section for a ${businessType} business.

Business Details:
- Business Name: ${businessName}
- Business Type: ${businessType}
- Location: ${location}
- Services: ${servicesList.join(', ')}
${yearsInBusiness ? `- Years in Business: ${yearsInBusiness}+` : ''}
- Tone: ${tone}

Generate 12-15 common questions and detailed answers covering:
- Services and pricing
- Process and timeline
- Service area and availability
- Qualifications and experience
- Guarantees and warranties
- Scheduling and payment

IMPORTANT: Respond with ONLY valid JSON array, no markdown:
{
  "faqs": [
    {
      "question": "What services do you offer?",
      "answer": "Detailed answer here..."
    }
  ]
}`;

        // =================================================================
        // CALL GEMINI API FOR ALL PAGES
        // =================================================================
        const prompts = {
            about: aboutPrompt,
            services: servicesPrompt,
            contact: contactPrompt,
            faq: faqPrompt
        };

        const results = {};

        for (const [pageType, prompt] of Object.entries(prompts)) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                        topP: 0.95,
                        topK: 40
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(`Gemini API error for ${pageType}:`, error);
                throw new Error(`Failed to generate ${pageType} page`);
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;

            // Parse JSON response
            try {
                const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || aiResponse.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
                results[pageType] = JSON.parse(jsonStr);
            } catch (parseError) {
                console.error(`Failed to parse ${pageType} response:`, aiResponse);
                throw new Error(`Failed to parse ${pageType} page`);
            }
        }

        // =================================================================
        // GENERATE PRIVACY POLICY & TERMS (Template-based, customized)
        // =================================================================
        results.privacy = generatePrivacyPolicy(businessName, website || 'your-website.com', email || 'contact@yourbusiness.com', location);
        results.terms = generateTermsOfService(businessName, website || 'your-website.com', location);

        // Return all generated pages
        return res.status(200).json({
            success: true,
            pages: results
        });

    } catch (error) {
        console.error('Error generating copy kit:', error);
        return res.status(500).json({
            error: 'Failed to generate copy kit',
            message: error.message
        });
    }
}

// Template functions for legal pages
function generatePrivacyPolicy(businessName, website, email, location) {
    return `Privacy Policy for ${businessName}

Last Updated: ${new Date().toLocaleDateString()}

${businessName} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website ${website}.

Information We Collect:
We may collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us. This information may include: name, email address, phone number, mailing address, and any other information you choose to provide.

How We Use Your Information:
We use the information we collect to:
• Provide, operate, and maintain our website
• Improve, personalize, and expand our website
• Understand and analyze how you use our website
• Communicate with you about services, updates, and promotional offers
• Process your transactions and send related information
• Respond to your comments, questions, and provide customer service

Information Sharing:
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or as necessary to provide our services.

Contact Us:
If you have questions about this Privacy Policy, please contact us at:
${businessName}
${location}
Email: ${email}

This privacy policy was last updated on ${new Date().toLocaleDateString()}.`;
}

function generateTermsOfService(businessName, website, location) {
    return `Terms of Service for ${businessName}

Last Updated: ${new Date().toLocaleDateString()}

1. Agreement to Terms
By accessing or using ${website}, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.

2. Use License
Permission is granted to temporarily access the materials on ${businessName}'s website for personal, non-commercial transitory viewing only. This license shall automatically terminate if you violate any of these restrictions.

3. Services
${businessName} provides ${businessName.includes('Services') ? 'professional services' : 'products and services'} as described on our website. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.

4. User Responsibilities
You agree to:
• Provide accurate, current, and complete information
• Maintain the confidentiality of your account (if applicable)
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use

5. Payment Terms
Payment is due as specified in our service agreements. We accept various payment methods as indicated on our website. All prices are subject to change with notice.

6. Limitation of Liability
${businessName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.

7. Governing Law
These terms shall be governed by the laws of ${location.split(',').pop().trim()}, without regard to its conflict of law provisions.

8. Contact Information
For questions about these Terms, contact us at:
${businessName}
${location}
Website: ${website}

These terms were last updated on ${new Date().toLocaleDateString()}.`;
}
