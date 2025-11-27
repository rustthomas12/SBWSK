# GoDaddy API Setup Guide

Get real-time domain pricing from GoDaddy's official API in 5 minutes.

## Why Use GoDaddy API?

- ✅ **100% Free** - No cost for API access
- ✅ **Real-time pricing** - Always accurate, including promotions
- ✅ **Official API** - Allowed and supported by GoDaddy
- ✅ **Easy setup** - Just 2 API keys needed

## Step-by-Step Setup

### Step 1: Create GoDaddy Developer Account

1. Go to: https://developer.godaddy.com
2. Click **"Sign In"** (top right)
3. Sign in with your GoDaddy account (or create a free one)
4. You don't need to have any domains purchased

### Step 2: Create Production API Keys

1. Go to: https://developer.godaddy.com/keys
2. Click **"Create New API Key"**
3. Choose **"Production"** environment
   - Production is free and has real pricing data
   - Sandbox is for testing only (fake data)
4. Give it a name: `SBWSK Domain Pricing`
5. Click **"Next"**

### Step 3: Copy Your API Keys

You'll see two values:
- **API Key** - A long string like `abc123_XYZ...`
- **API Secret** - Another long string like `ABC456def...`

**Important**: Copy both values immediately! The secret is only shown once.

### Step 4: Add Keys to Your Environment

#### For Local Development (Vercel CLI)

Create a `.env.local` file in your SBWSK folder:

```bash
GODADDY_API_KEY=your_api_key_here
GODADDY_API_SECRET=your_api_secret_here
```

#### For Vercel Deployment

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your SBWSK project
3. Go to **Settings → Environment Variables**
4. Add two variables:
   - Name: `GODADDY_API_KEY`, Value: your API key
   - Name: `GODADDY_API_SECRET`, Value: your API secret
5. Click **Save**
6. Redeploy your site (Vercel does this automatically)

#### For Netlify Deployment

1. Go to: https://app.netlify.com
2. Select your SBWSK site
3. Go to **Site settings → Build & deploy → Environment**
4. Click **Edit variables**
5. Add:
   - `GODADDY_API_KEY` = your API key
   - `GODADDY_API_SECRET` = your API secret
6. Click **Save**
7. Trigger a new deploy

### Step 5: Verify It Works

1. Deploy your site (or run locally)
2. Go to the Domain Checker page
3. Search for any domain (e.g., "test")
4. In the price comparison:
   - GoDaddy prices should show
   - Check the metadata at the bottom
   - Should say "Live API data available" if working

## Important: Production API Requirements

The GoDaddy Production API has a requirement:
- **50+ domains** in your account for availability checks

If you don't have 50+ domains:
- **Pricing API still works!** (This is what we use)
- Only the deep availability check requires 50+ domains
- We use DNS checking for availability instead

## Troubleshooting

### "Configure GODADDY_API_KEY for real-time pricing"

**Problem**: API keys not configured or not found

**Solutions**:
1. Check environment variable names match exactly (case-sensitive)
2. Verify keys are deployed to production (not just local)
3. Redeploy after adding environment variables

### "GoDaddy API error: 401 Unauthorized"

**Problem**: Invalid or expired API keys

**Solutions**:
1. Double-check you copied the keys correctly
2. Make sure you're using Production keys (not Sandbox)
3. Regenerate keys at https://developer.godaddy.com/keys

### "GoDaddy API error: timeout"

**Problem**: Slow network or API is down

**Solutions**:
- Wait a few minutes and try again
- Check GoDaddy API status: https://developer.godaddy.com
- Fallback pricing will be used automatically

### Prices Still Showing as "Fallback"

**Check**:
1. Environment variables are set correctly
2. Redeployed after adding variables
3. Check server logs for error messages
4. Verify API keys are Production (not Sandbox)

## Testing Your Setup

### Local Testing

```bash
# In your SBWSK directory
npx vercel dev

# Then visit: http://localhost:3000/domain-checker.html
```

### Check Logs

Look at your deployment logs:
- Vercel: Project → Deployments → View logs
- Netlify: Deploys → Deploy log
- Look for "GoDaddy API" messages

## Security Notes

### DO NOT:
- ❌ Commit API keys to Git
- ❌ Share API keys publicly
- ❌ Use keys in client-side code

### DO:
- ✅ Use environment variables only
- ✅ Keep keys in server-side functions
- ✅ Add `.env.local` to `.gitignore`

Your `.gitignore` should include:
```
.env
.env.local
.env.production
```

## Rate Limits

GoDaddy API rate limits:
- **60 requests per minute** per API key
- More than enough for typical usage
- Caching (30 minutes) prevents hitting limits

## Cost

**$0.00** - Completely free!

The GoDaddy Developer API is free to use. There are no:
- Monthly fees
- Per-request charges
- Setup costs
- Minimum usage requirements

## Next Steps

Once GoDaddy API is working:

1. ✅ You're getting real-time pricing for GoDaddy
2. Consider adding Namecheap API (requires 20+ domains or $50 balance)
3. Update fallback prices quarterly: See `PRICING_UPDATE_GUIDE.md`

## API Documentation

Full GoDaddy API docs: https://developer.godaddy.com/doc/endpoint/domains

## Questions?

If you encounter issues:
1. Check troubleshooting section above
2. Review GoDaddy's API documentation
3. Check your server logs for specific error messages

**Important**: The system will always fall back to standard pricing if the API fails, so users will never see errors.
