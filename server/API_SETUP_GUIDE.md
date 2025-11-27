# Real-Time Pricing API Setup Guide

This guide walks you through setting up real-time domain pricing for your SBWSK website.

## Step 1: Sign Up for ResellerClub

1. **Go to**: https://www.resellerclub.com/
2. **Click**: "Sign Up" or "Become a Reseller"
3. **Fill out** the registration form:
   - Business name
   - Contact information
   - Email and password
4. **Complete verification** (may require business documentation)
5. **Wait for approval** (usually 1-3 business days)

## Step 2: Get Your API Credentials

Once your account is approved:

1. **Log in** to your ResellerClub reseller panel
2. **Navigate to**: Settings → API
   - Or go directly to: https://manage.resellerclub.com/servlet/APISettings
3. **Copy your credentials**:
   - **Auth ID** (also called Reseller ID)
   - **API Key**
4. **Keep these secure** - treat them like passwords!

## Step 3: Configure Your Environment

1. **Navigate to** the server directory:
   ```bash
   cd server
   ```

2. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

3. **Edit .env** and add your credentials:
   ```bash
   RESELLERCLUB_AUTH_ID=123456
   RESELLERCLUB_API_KEY=abcdef1234567890
   ```

4. **Save the file**

## Step 4: Install Dependencies

```bash
cd server
npm install
```

This installs:
- `express` - Web server framework
- `axios` - HTTP client for API calls
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing

## Step 5: Test the API Server Locally

1. **Start the server**:
   ```bash
   node api-price-checker.js
   ```

2. **You should see**:
   ```
   ✅ Price API server running on port 3000
   📦 Cache duration: 6 hours
   🔑 ResellerClub: Configured
   🔑 GoDaddy: Not configured
   ```

3. **Test in your browser**:
   - Go to: http://localhost:3000/api/domain-prices/com
   - You should see JSON with pricing data

4. **Check health endpoint**:
   - Go to: http://localhost:3000/health
   - Should show: `{"status":"ok","cacheSize":1,"timestamp":"..."}`

## Step 6: Deploy Your API Server

### Option A: Deploy to Railway (Recommended - Free Tier Available)

1. **Sign up**: https://railway.app/
2. **Click**: "New Project" → "Deploy from GitHub repo"
3. **Select** your SBWSK repository
4. **Set root directory**: `/server`
5. **Add environment variables**:
   - `RESELLERCLUB_AUTH_ID`
   - `RESELLERCLUB_API_KEY`
   - `PORT` (Railway sets this automatically)
6. **Deploy** - Railway will auto-detect Node.js and run your server
7. **Copy** your deployment URL (e.g., `https://your-app.railway.app`)

### Option B: Deploy to Render

1. **Sign up**: https://render.com/
2. **Click**: "New" → "Web Service"
3. **Connect** your GitHub repository
4. **Configure**:
   - Name: `sbwsk-pricing-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node api-price-checker.js`
   - Root Directory: `server`
5. **Add environment variables** in the dashboard
6. **Create Web Service**
7. **Copy** your deployment URL

### Option C: Deploy to Vercel (Serverless)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd server
   vercel
   ```

3. **Add environment variables** via Vercel dashboard
4. **Copy** your deployment URL

## Step 7: Update Frontend to Use API

You'll update your `domain-checker.js` to fetch prices from your deployed API instead of using hardcoded values.

See the updated `domain-checker.js` for implementation details.

## Troubleshooting

### "Not configured" error
- Check that your `.env` file exists in the `server/` directory
- Verify credentials are correct (no extra spaces or quotes)
- Restart the server after changing `.env`

### API returns null prices
- Verify your ResellerClub account is active
- Check that the TLD is supported by ResellerClub
- Look at server logs for detailed error messages

### CORS errors in frontend
- Make sure the server has `cors` enabled (already configured)
- Check that your frontend is calling the correct API URL

### Rate limiting
- ResellerClub has rate limits (usually 1000 requests/hour)
- The API caches results for 6 hours to minimize calls
- Don't make requests on every page load - cache on frontend too

## Cost Breakdown

- **ResellerClub Account**: FREE to join
- **API Calls**: FREE (no per-request charges)
- **Domain Sales**: You pay wholesale prices only when customers buy
  - Example: .com wholesale = $8-10, sell for $15-20 = $5-10 profit per domain
- **Server Hosting**:
  - Railway: Free tier (500 hours/month)
  - Render: Free tier available
  - Vercel: Free tier (generous limits)

## Support

- **ResellerClub Docs**: https://manage.resellerclub.com/kb
- **API Documentation**: https://manage.resellerclub.com/kb/answer/751
- **Support**: support@resellerclub.com

## Next Steps

1. ✅ API server is configured and deployed
2. → Update frontend to use real-time pricing
3. → Test on your live website
4. → Monitor API usage and costs
