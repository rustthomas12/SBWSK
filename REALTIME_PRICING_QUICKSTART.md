# Real-Time Pricing - Quick Start

## What You Need

1. **ResellerClub Account** (5 minutes to sign up, 1-3 days for approval)
2. **API Credentials** (get from ResellerClub dashboard)
3. **Server Deployment** (Railway/Render/Vercel - free tier available)

## 3-Step Setup

### 1. Get API Credentials (10 minutes)

```
1. Sign up at: https://www.resellerclub.com/
2. Wait for account approval (1-3 business days)
3. Get credentials from: Reseller Panel → Settings → API
   - Copy your AUTH ID
   - Copy your API KEY
```

### 2. Configure Server (2 minutes)

```bash
cd server
cp .env.example .env
nano .env  # or use your editor
```

Add your credentials:
```env
RESELLERCLUB_AUTH_ID=your_auth_id_here
RESELLERCLUB_API_KEY=your_api_key_here
```

### 3. Deploy (5 minutes)

**Option A - Railway (Easiest)**
```
1. Go to https://railway.app/
2. New Project → Deploy from GitHub
3. Select your repo, set root directory: /server
4. Add environment variables (same as .env file)
5. Deploy!
```

**Option B - Render**
```
1. Go to https://render.com/
2. New → Web Service → Connect GitHub
3. Configure:
   - Root Directory: server
   - Build: npm install
   - Start: node api-price-checker.js
4. Add environment variables
5. Deploy!
```

## Test Your API

After deployment, visit:
- `https://your-api-url.com/health` - Should show "status": "ok"
- `https://your-api-url.com/api/domain-prices/com` - Should show pricing data

## Update Frontend

Your current website uses hardcoded prices. To use real-time pricing, you'll need to update `js/domain-checker.js` to fetch from your API.

I can help you with this step once your API is deployed!

## Costs

- ResellerClub: **$0** (free to join, only pay wholesale when domains sell)
- API Calls: **$0** (no per-request fees)
- Server Hosting: **$0** (free tiers available on Railway/Render/Vercel)

**Total: $0/month** until you start selling domains!

## Need Help?

Full detailed guide: `server/API_SETUP_GUIDE.md`

## Already Have Credentials?

Just need to deploy? Here's the fastest path:

```bash
cd server
npm install
node api-price-checker.js  # Test locally first
```

Then deploy to Railway or Render (see step 3 above).
