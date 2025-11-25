/**
 * Serverless Function: Submit Lead
 * Handles form submissions from the contact and quote estimator forms
 *
 * This works with both Netlify Functions and Vercel Serverless Functions
 */

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);

        // Basic validation
        if (!data.email || !data.name) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    error: 'Name and email are required'
                })
            };
        }

        // TODO: In production, you would:
        // 1. Send email via SendGrid, Mailgun, or similar service
        // 2. Save to a database or CRM
        // 3. Add to email marketing list (with consent)

        // For now, just log the submission
        console.log('Lead submission received:', {
            name: data.name,
            email: data.email,
            business: data.business,
            timestamp: data.timestamp,
            source: data.source
        });

        // Example: SendGrid integration (uncomment and add API key)
        /*
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        await sgMail.send({
            to: 'your-email@example.com',
            from: 'noreply@yourdomain.com',
            subject: `New Lead: ${data.name} - ${data.source}`,
            text: `
                Name: ${data.name}
                Email: ${data.email}
                Business: ${data.business || 'Not provided'}
                Source: ${data.source}

                Message:
                ${data.message || 'No message provided'}
            `
        });
        */

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Form submitted successfully'
            })
        };

    } catch (error) {
        console.error('Error processing submission:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};

// For local testing
if (require.main === module) {
    const testEvent = {
        httpMethod: 'POST',
        body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            business: 'Test Business',
            message: 'This is a test message',
            timestamp: new Date().toISOString(),
            source: 'test'
        })
    };

    exports.handler(testEvent, {})
        .then(response => console.log('Response:', response))
        .catch(error => console.error('Error:', error));
}
