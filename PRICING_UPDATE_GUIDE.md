# Domain Pricing Update Guide

This guide explains how to maintain accurate domain pricing in your SBWSK application.

## Overview

The pricing system uses a **hybrid approach**:
- **API-based pricing** (GoDaddy, Namecheap) - Real-time when configured
- **Fallback pricing** (Hostinger, Bluehost, SiteGround) - Manually verified standard rates

## When to Update Prices

Update the fallback prices when:
- Prices change significantly (more than $2 difference)
- New promotions are available
- Every 3-6 months for general maintenance
- When you notice pricing discrepancies

## How to Update Fallback Prices

### Step 1: Verify Current Prices

Visit each registrar's website and check current prices for domain registration:

1. **GoDaddy**: https://www.godaddy.com/domains/domain-name-search
2. **Namecheap**: https://www.namecheap.com/domains/registration/results/
3. **Hostinger**: https://www.hostinger.com/domain-name-search
4. **Bluehost**: https://www.bluehost.com/domains (note: usually free with hosting)
5. **SiteGround**: https://www.siteground.com/domains

**Important**: Look for the FIRST YEAR registration price, not renewal prices.

### Step 2: Update the FALLBACK_PRICES Object

Edit the file: `/api/get-domain-pricing.js`

Find the `FALLBACK_PRICES` object (around line 25) and update:

```javascript
const FALLBACK_PRICES = {
    lastUpdated: '2025-11-27', // ← UPDATE THIS DATE!
    prices: {
        '.com': {
            GoDaddy: 11.99,        // Standard price (update if changed)
            Namecheap: 13.98,      // Standard price
            Hostinger: {
                regular: 9.99,
                promo: 0.99,        // Update if promotion changes
                promoNote: '90% off first year'
            },
            Bluehost: {
                first: 0,           // Usually free
                renewal: 24.19,     // Renewal price
                note: 'FREE with hosting'
            },
            SiteGround: 15.95      // Standard price
        },
        // ... repeat for other TLDs
    }
};
```

### Step 3: What to Update

For each registrar and TLD:

**Standard Pricing (GoDaddy, Namecheap, SiteGround)**:
- Update the single number if price changed
- Example: `GoDaddy: 12.99`

**Promotional Pricing (Hostinger)**:
- Update `regular` (normal price), `promo` (promotional price), and `promoNote`
- If no promotion, use: `Hostinger: 9.99` (just the number)

**Bluehost**:
- Usually free with hosting, so `first: 0`
- Update `renewal` if renewal price changed
- Keep `note: 'FREE with hosting'`

### Step 4: Update the lastUpdated Date

Change the `lastUpdated` field to today's date:
```javascript
lastUpdated: '2025-11-27', // ← Change to current date (YYYY-MM-DD)
```

This date is displayed to users so they know how recent the pricing is.

## Supported TLDs

Currently tracking prices for:
- `.com` (most common)
- `.net`
- `.org`
- `.co`
- `.io`
- `.biz`

To add more TLDs, add a new entry following the same pattern.

## API Configuration (Optional)

For real-time pricing, configure these environment variables:

### GoDaddy API (Free)
```bash
GODADDY_API_KEY=your_api_key
GODADDY_API_SECRET=your_api_secret
```

Get keys at: https://developer.godaddy.com/keys

**Requirements**:
- Free GoDaddy Developer account
- 50+ domains for Production API access (Sandbox is always available)

### Namecheap API
```bash
NAMECHEAP_API_USER=your_username
NAMECHEAP_API_KEY=your_api_key
NAMECHEAP_CLIENT_IP=your_server_ip
```

**Requirements**:
- Namecheap account with 20+ domains OR $50+ balance
- API enabled in Account → Profile → API Access
- Server IP whitelisted

## Price Verification Checklist

When updating prices, verify:

- [ ] Checked all 5 providers for each TLD
- [ ] Recorded FIRST YEAR prices (not renewal)
- [ ] Noted any active promotions
- [ ] Updated `lastUpdated` date
- [ ] Tested the domain checker after changes
- [ ] Verified prices display correctly on frontend

## Testing After Updates

1. Start your development server
2. Go to the Domain Checker page
3. Search for a domain (e.g., "test")
4. Verify:
   - Prices match what you entered
   - Promotional pricing shows correctly
   - "Verified [date]" shows your update date
   - All 5 providers display

## Deployment

After updating prices:

1. Commit changes:
```bash
git add api/get-domain-pricing.js
git commit -m "Update domain pricing - verified YYYY-MM-DD"
git push
```

2. Deploy to production (Vercel/Netlify will auto-deploy)

3. Clear any CDN cache if needed

## Affiliate Considerations

**Important**: Your pricing display must be accurate for affiliate compliance. Most affiliate programs require:

- ✅ Prices shown are current and verified
- ✅ Disclaimers about promotions ("Verify at [registrar]")
- ✅ Clear indication of first-year vs renewal pricing
- ✅ Disclosure of affiliate relationships

The system includes these disclaimers automatically, but ensure pricing stays current.

## Monitoring

Set a calendar reminder to:
- Check prices monthly during high-promotion periods (Jan, Nov)
- Update quarterly (every 3 months) otherwise
- Check immediately if users report pricing discrepancies

## Questions?

If you see significantly different prices:
1. Check if you're looking at first-year vs renewal
2. Check for hidden promotional codes on registrar sites
3. Prices may vary by location/currency
4. Some prices are only available with hosting bundles
