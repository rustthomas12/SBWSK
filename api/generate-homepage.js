/**
 * Serverless function to generate professional homepage copy using Claude AI
 * This provides accurate, AI-generated copy instead of template-based content
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
            phoneNumber
        } = req.body;

        // Validate required fields
        if (!businessName || !businessType || !location || !services) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

        if (!CLAUDE_API_KEY) {
            console.error('CLAUDE_API_KEY not configured');
            return res.status(500).json({ error: 'API configuration error' });
        }

        // Parse services list
        const servicesList = services.split('\n').filter(s => s.trim()).map(s => s.trim());

        // Construct prompt for Claude
        const prompt = `You are a professional copywriter specializing in small business websites. Generate compelling, conversion-focused homepage copy for a ${businessType} business.

Business Details:
- Business Name: ${businessName}
- Business Type: ${businessType}
- Location: ${location}
- Services: ${servicesList.join(', ')}
${uniqueValue ? `- Unique Value Proposition: ${uniqueValue}` : ''}
- Target Audience: ${targetAudience}
${yearsInBusiness ? `- Years in Business: ${yearsInBusiness}+` : ''}
${phoneNumber ? `- Phone: ${phoneNumber}` : ''}
- Desired Tone: ${tone}

Generate the following 7 sections of homepage copy. Make it professional, benefit-focused, and conversion-oriented:

1. Hero Headline (8-12 words, punchy and memorable)
2. Hero Subheadline (15-25 words, emphasize key benefit)
3. About Section (2-3 sentences introducing the business and building trust)
4. Services Introduction (1-2 sentences setting up the services section)
5. Services Section (For each service: title and 1-2 sentence benefit-focused description)
6. Why Choose Us Section (3-5 bullet points highlighting competitive advantages)
7. Call-to-Action (Strong, action-oriented CTA with urgency)

Format your response as valid JSON with these exact keys:
{
  "heroHeadline": "...",
  "heroSubheadline": "...",
  "aboutSection": "...",
  "servicesIntro": "...",
  "servicesSection": "...",
  "whyChooseSection": "...",
  "ctaSection": "..."
}

Important:
- Use a ${tone} tone throughout
- Focus on benefits, not just features
- Include specific location references (${location})
- Make it authentic and avoid clichés
- Ensure all copy is ready to use on a real website`;

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2048,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Claude API error:', error);
            return res.status(500).json({ error: 'AI generation failed' });
        }

        const data = await response.json();
        const aiResponse = data.content[0].text;

        // Parse the JSON response from Claude
        let generatedCopy;
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || aiResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
            generatedCopy = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('Failed to parse Claude response:', aiResponse);
            return res.status(500).json({ error: 'Failed to parse AI response' });
        }

        // Return the generated copy
        return res.status(200).json({
            success: true,
            copy: generatedCopy
        });

    } catch (error) {
        console.error('Error generating homepage:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
