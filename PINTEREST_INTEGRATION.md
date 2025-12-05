# Pinterest Conversion Tracking Integration

This document explains the Pinterest Tag and Conversion API integration for SBWSK.

## Overview

We've implemented **dual-tracking** for Pinterest conversions:
1. **Client-side tracking** - Pinterest Tag (pintrk) for immediate browser-based tracking
2. **Server-side tracking** - Pinterest Conversion API for reliable, privacy-safe tracking

## Configuration

### Pinterest Credentials
- **Tag ID**: `2612806189856`
- **API Access Token**: Stored in environment variable `PINTEREST_API_TOKEN`
- **Ad Account ID**: Stored in environment variable `PINTEREST_AD_ACCOUNT_ID`

### Environment Variables (Vercel)
Already configured in Vercel project settings. Tokens are kept secret for security.

### Files Modified
- **All HTML pages** (31 files) - Pinterest Tag added to `<head>`
- `copy-kit-success.html` - Checkout conversion tracking
- `js/quote-estimator.js` - Lead conversion tracking
- `js/domain-checker.js` - Custom event tracking
- `logo-generator.html` - Custom event tracking

### New Files Created
- `/api/pinterest-conversion.js` - Server-side conversion API endpoint
- `/js/pinterest-tracking.js` - Helper functions for dual tracking

## Events Being Tracked

### 1. PageVisit Events
Automatically tracked on all pages via Pinterest Tag.

### 2. Checkout Events
**Triggered on**: Copy Kit purchase success page (`copy-kit-success.html`)

```javascript
pintrk('track', 'checkout', {
    value: 17,
    currency: 'USD',
    order_id: sessionId,
    line_items: [{
        product_name: 'Website Copy Kit',
        product_id: 'copy-kit-17',
        product_price: 17,
        product_quantity: 1
    }]
});
```

### 3. Lead Events
**Triggered on**: Quote estimator completion (`js/quote-estimator.js`)

```javascript
pintrk('track', 'lead', {
    value: pricing.total,
    currency: 'USD',
    lead_type: 'Website Quote Request'
});
```

### 4. Custom Events

**Domain Search** (`js/domain-checker.js`):
```javascript
pintrk('track', 'custom', {
    event_name: 'DomainSearchCompleted',
    value: 0,
    currency: 'USD',
    search_string: domainName
});
```

**Logo Download** (`logo-generator.html`):
```javascript
pintrk('track', 'custom', {
    event_name: 'LogoDownloaded',
    value: 0,
    currency: 'USD'
});
```

## Using the Helper Functions

Include the helper script on pages where you need dual tracking:

```html
<script src="js/pinterest-tracking.js"></script>
```

### Track a Purchase
```javascript
await trackPurchase(
    17,                    // value
    'session_123',         // order ID
    [{
        product_name: 'Website Copy Kit',
        product_id: 'copy-kit-17',
        product_price: 17,
        product_quantity: 1
    }],
    'user@example.com'     // optional email (hashed server-side)
);
```

### Track a Lead
```javascript
await trackLead(
    'Contact Form',        // lead type
    0,                     // estimated value
    'user@example.com'     // optional email
);
```

### Track a Custom Event
```javascript
await trackCustomEvent('ToolUsed', {
    tool_name: 'Domain Checker',
    value: 0,
    currency: 'USD'
});
```

## Server-side API Endpoint

**Endpoint**: `/api/pinterest-conversion`

**Method**: POST

**Request Body**:
```json
{
    "event_name": "checkout",
    "event_id": "unique_event_id",
    "custom_data": {
        "value": 17,
        "currency": "USD",
        "order_id": "session_123"
    },
    "user_data": {
        "em": "user@example.com",
        "client_user_agent": "Mozilla/5.0...",
        "event_source_url": "https://example.com/page"
    }
}
```

**Response**:
```json
{
    "success": true,
    "message": "Conversion tracked",
    "pinterest_response": {...}
}
```

## Event Deduplication

To prevent duplicate tracking between client-side and server-side events, we use unique `event_id` values:

```javascript
const eventId = 'pint_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
```

Both the Pinterest Tag and API call use the same `event_id` so Pinterest can deduplicate them.

## Privacy & Security

- **Email Hashing**: User emails are hashed using SHA-256 before sending to Pinterest API
- **Phone Hashing**: Phone numbers are cleaned and hashed before sending
- **No PII in URLs**: Never pass unhashed personal information in URL parameters
- **API Token**: Stored server-side in environment variables (not in code)

## Testing

### Verify Pinterest Tag is Loaded
Open browser console and run:
```javascript
console.log(typeof pintrk); // Should output: "function"
```

### Verify Events are Firing
1. Open Pinterest Tag Helper browser extension
2. Navigate to a tracked page
3. Complete a tracked action (purchase, quote, etc.)
4. Check Pinterest Tag Helper for event details

### Test Server-side API
```javascript
fetch('/api/pinterest-conversion', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        event_name: 'page_visit',
        event_id: 'test_' + Date.now(),
        custom_data: {value: 0, currency: 'USD'},
        user_data: {
            client_user_agent: navigator.userAgent,
            event_source_url: window.location.href
        }
    })
})
.then(r => r.json())
.then(console.log);
```

## Monitoring

Check Pinterest Events Manager to verify:
- Events are being received
- Deduplication is working (no duplicate events)
- Event data is accurate (values, currencies, etc.)
- Attribution is working for conversions

## Future Enhancements

Consider adding tracking for:
- Template downloads
- Homepage generator usage
- Speed check completions
- Website audit completions
- Blog post views
- Newsletter signups (if added)

## Support

For issues with Pinterest tracking:
1. Check browser console for JavaScript errors
2. Verify Pinterest Tag is loaded: `typeof pintrk`
3. Check Pinterest Events Manager for event delivery
4. Review `/api/pinterest-conversion` logs for server-side errors
