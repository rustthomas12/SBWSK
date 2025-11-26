/**
 * Serverless function to check domain availability
 * Uses Google's Public DNS API (no auth required, reliable)
 */

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Support both POST body and GET query params
        const domain = req.method === 'POST' ? req.body?.domain : req.query?.domain;

        if (!domain) {
            return res.status(400).json({ error: 'Domain name is required' });
        }

        // Validate domain format
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(domain)) {
            return res.status(400).json({ error: 'Invalid domain format' });
        }

        // Use Google's Public DNS API to check if domain has DNS records
        // If it has ANY records (A, NS, MX, etc.), it's registered
        const dnsApiUrl = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`;

        let available = true;
        let registrationInfo = null;

        try {
            const dnsResponse = await fetch(dnsApiUrl);
            const dnsData = await dnsResponse.json();

            // If DNS returns answers or the domain has nameservers, it's taken
            if (dnsData.Answer || dnsData.Status === 0) {
                available = false;
                registrationInfo = {
                    note: 'Domain is registered and has DNS records'
                };
            } else if (dnsData.Status === 3) {
                // NXDOMAIN - domain doesn't exist, likely available
                available = true;
            } else {
                // Other DNS statuses - check nameservers as backup
                const nsApiUrl = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=NS`;
                const nsResponse = await fetch(nsApiUrl);
                const nsData = await nsResponse.json();

                if (nsData.Answer) {
                    // Has nameservers = registered
                    available = false;
                    registrationInfo = {
                        note: 'Domain is registered'
                    };
                } else {
                    available = true;
                }
            }
        } catch (dnsError) {
            console.error('DNS lookup error:', dnsError);
            // If DNS check fails completely, return as unknown
            return res.status(200).json({
                domain,
                available: null,
                error: 'Unable to verify domain status'
            });
        }

        res.status(200).json({
            domain,
            available,
            registrationInfo
        });

    } catch (error) {
        console.error('Error checking domain:', error);
        res.status(500).json({
            error: 'Failed to check domain availability',
            details: error.message
        });
    }
};
