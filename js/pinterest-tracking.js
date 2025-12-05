/**
 * Pinterest Conversion Tracking Helper
 * Sends both client-side (pintrk) and server-side (API) events
 */

/**
 * Track a conversion event to Pinterest (both client and server-side)
 * @param {string} eventName - Event type: 'checkout', 'lead', 'page_visit', 'custom'
 * @param {Object} customData - Event-specific data
 * @param {Object} userData - User data (optional, for better attribution)
 */
async function trackPinterestConversion(eventName, customData = {}, userData = {}) {
    // Generate unique event ID to deduplicate between client and server events
    const eventId = 'pint_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 1. Client-side tracking (Pinterest Tag)
    if (typeof pintrk !== 'undefined') {
        pintrk('track', eventName, {
            ...customData,
            event_id: eventId
        });
    }

    // 2. Server-side tracking (Pinterest Conversion API)
    try {
        await fetch('/api/pinterest-conversion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_name: eventName,
                event_id: eventId,
                custom_data: customData,
                user_data: {
                    ...userData,
                    client_user_agent: navigator.userAgent,
                    event_source_url: window.location.href
                }
            })
        });
        console.log('Pinterest conversion tracked:', eventName);
    } catch (error) {
        console.error('Failed to track Pinterest server-side conversion:', error);
        // Client-side tracking already sent, so we don't fail completely
    }
}

/**
 * Track a purchase/checkout event
 * @param {number} value - Purchase value
 * @param {string} orderId - Order/Session ID
 * @param {Array} lineItems - Array of purchased items
 * @param {string} userEmail - Customer email (optional, will be hashed server-side)
 */
async function trackPurchase(value, orderId, lineItems = [], userEmail = null) {
    await trackPinterestConversion('checkout', {
        value: value,
        currency: 'USD',
        order_id: orderId,
        line_items: lineItems
    }, {
        em: userEmail // Will be hashed server-side
    });
}

/**
 * Track a lead generation event
 * @param {string} leadType - Type of lead (e.g., 'Quote Request', 'Contact Form')
 * @param {number} value - Estimated lead value
 * @param {string} userEmail - Lead email (optional)
 */
async function trackLead(leadType, value = 0, userEmail = null) {
    await trackPinterestConversion('lead', {
        lead_type: leadType,
        value: value,
        currency: 'USD'
    }, {
        em: userEmail
    });
}

/**
 * Track a custom event
 * @param {string} customEventName - Name of custom event
 * @param {Object} customData - Additional data
 */
async function trackCustomEvent(customEventName, customData = {}) {
    await trackPinterestConversion('custom', {
        event_name: customEventName,
        ...customData
    });
}

// Make functions available globally
window.trackPinterestConversion = trackPinterestConversion;
window.trackPurchase = trackPurchase;
window.trackLead = trackLead;
window.trackCustomEvent = trackCustomEvent;
