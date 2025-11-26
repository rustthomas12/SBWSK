# Real-Time Domain Price API Server

This server provides real-time domain pricing by querying registrar APIs directly before showing prices to customers.

## ⚠️ Requirements

### 1. **Reseller Accounts**

You need reseller/partner accounts with each provider:

**GoDaddy** (Easiest to start with):
- Sign up: https://www.godaddy.com/reseller
- Get API keys: https://developer.godaddy.com/keys
- Cost: Free to join, but may require business verification
- API Docs: https://developer.godaddy.com/doc

**Hostinger**:
- Contact: reseller@hostinger.com
- Requirements: Business account, may need minimum volume
- Currently no public API - requires partnership

**Bluehost**:
- Contact: https://www.bluehost.com/partners
- Requires EIG partner program enrollment
- May need established web hosting business

**SiteGround**:
- Contact: partners@siteground.com
- Requires reseller partnership application
- No public API documentation

### 2. **Alternative: Use an Aggregator**

**Easier Option - ResellerClub/LogicBoxes:**
- Single API for multiple registrars
- Website: https://www.resellerclub.com/
- Provides pricing for 100+ TLDs
- Single integration instead of 4+ separate ones
- API Docs: https://manage.resellerclub.com/kb/answer/751

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install express axios dotenv cors
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env and add your API credentials
```

### 3. Start the Server

```bash
node api-price-checker.js
```

### 4. Update Frontend

Your frontend (`domain-checker.js`) would call this API instead of using hardcoded prices:

```javascript
// Instead of PROVIDER_PRICING object, fetch from API
async function getPricesForExtension(extension) {
    const response = await fetch(`http://your-server.com/api/domain-prices/${extension}`);
    return await response.json();
}
```

## Deployment Options

### Option A: Deploy to Vercel/Netlify Functions
- Convert to serverless function
- No always-on server needed
- Pay per request

### Option B: Deploy to Heroku/Railway/Render
- Traditional server deployment
- Runs 24/7
- $5-10/month

### Option C: Use Your Own VPS
- Host alongside your website
- Full control
- Requires server management

## Cost Breakdown

**With Individual APIs:**
- GoDaddy: Free (pay per domain sold)
- Hostinger/Bluehost/SiteGround: Requires reseller contracts

**With ResellerClub:**
- Free to join
- Pay wholesale prices when domains sell
- ~$8-10/domain cost vs $15-20 retail

## Rate Limiting

All APIs have rate limits. Implement caching:
- Cache prices for 1-6 hours
- Most prices don't change hourly
- Reduces API calls by 90%+

## Recommendation

**For Quick Setup:**
1. Start with weekly auto-updates (already implemented)
2. Good enough for most use cases
3. Zero API costs
4. Prices stay reasonably current

**For Real-Time:**
1. Sign up for ResellerClub/LogicBoxes (easiest single API)
2. Deploy this server to Vercel/Railway
3. Update frontend to call API
4. More complex but 100% accurate

**Most users won't notice the difference between weekly updates vs real-time unless prices change dramatically.**
