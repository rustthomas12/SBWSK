# Google Ads API Setup Guide for SBWSK Keyword Tool

This guide will walk you through setting up the Google Ads API integration for the Local & General SEO Keyword Generator tool.

## Overview

The keyword tool uses the **Google Ads API** (specifically the `KeywordPlanIdeas` service) to fetch real search volume data, competition levels, and CPC estimates for keywords.

## Prerequisites

1. A **Google Ads account** (you can create one at [ads.google.com](https://ads.google.com))
2. A **Google Cloud Project** with the Google Ads API enabled
3. OAuth 2.0 credentials for the Google Ads API
4. A **Google Ads Developer Token**

---

## Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name it something like `sbwsk-keyword-tool`
4. Click **"Create"**

### Step 2: Enable the Google Ads API

1. In your Google Cloud Project, go to **"APIs & Services" > "Library"**
2. Search for **"Google Ads API"**
3. Click on it and press **"Enable"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth client ID"**
3. If prompted, configure the **OAuth consent screen**:
   - User type: **External** (or Internal if you have a Google Workspace)
   - App name: `SBWSK Keyword Tool`
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: No need to add scopes manually
   - Test users: Add your Google account email
   - Click **"Save and Continue"** through the steps

4. Back in **"Create OAuth client ID"**:
   - Application type: **Desktop app** (recommended) or **Web application**
   - Name: `SBWSK OAuth Client`
   - Click **"Create"**

5. **Download the JSON file** with your credentials:
   - Click the download icon next to your newly created OAuth 2.0 Client ID
   - Save it as `google-ads-credentials.json` (you'll need values from this file)

6. Open the downloaded JSON file. You'll need:
   - `client_id`
   - `client_secret`

### Step 4: Get a Google Ads Developer Token

1. Go to [Google Ads](https://ads.google.com/)
2. Click **Tools & Settings** (wrench icon) > **Setup** > **API Center**
3. Click **"Apply for access"** if you haven't already
   - **Note:** Google Ads Developer Tokens can take 24-48 hours to be approved
   - For development/testing, you can use a **test account** with "Basic" access level
4. Once approved, copy your **Developer Token**

### Step 5: Generate a Refresh Token

You need to generate an OAuth **refresh token** to authenticate API requests.

#### Option A: Use the Google Ads API Node.js Library Helper

1. Create a temporary file `generate-refresh-token.js`:

```javascript
const readline = require('readline');
const { google } = require('googleapis');

// Replace with your OAuth credentials from Step 3
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob' // For desktop apps
);

// Generate the URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/adwords',
});

console.log('\n===========================================');
console.log('Step 1: Authorize this app by visiting:');
console.log(authUrl);
console.log('===========================================\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Step 2: Enter the authorization code here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n===========================================');
    console.log('Success! Your refresh token is:');
    console.log(tokens.refresh_token);
    console.log('===========================================\n');
    console.log('Add this to your .env file as GOOGLE_ADS_REFRESH_TOKEN');
  } catch (error) {
    console.error('Error generating token:', error.message);
  }
  rl.close();
});
```

2. Run it:
```bash
npm install googleapis
node generate-refresh-token.js
```

3. Follow the instructions:
   - Visit the URL shown
   - Authorize the app with your Google account
   - Copy the authorization code
   - Paste it into the terminal
   - Copy the **refresh token** shown

4. Save the refresh token - you'll add it to your `.env` file

#### Option B: Use the Official Google Ads API Tool

```bash
npx google-ads-api generate-refresh-token
```

Follow the prompts and copy the refresh token.

### Step 6: Get Your Google Ads Customer ID

1. Log into [Google Ads](https://ads.google.com/)
2. Look at the top right corner - you'll see your **Customer ID** in the format `123-456-7890`
3. Copy this ID (remove the dashes when adding to `.env`)

### Step 7: Configure Environment Variables

Create or update your `.env` file in the project root:

```bash
# Google Ads API Credentials
GOOGLE_ADS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

**Important Notes:**
- `GOOGLE_ADS_CUSTOMER_ID` should be **without dashes** (e.g., `1234567890`, not `123-456-7890`)
- Keep all credentials secure and **never commit the `.env` file** to version control
- For Vercel deployment, add these as **Environment Variables** in your Vercel project settings

---

## Step 8: Install Dependencies

Run the following in your project root:

```bash
npm install
```

This will install the `google-ads-api` package added to `package.json`.

---

## Step 9: Test the API Locally

1. Start the Vercel dev server:
```bash
npm run dev
```

2. Open your browser to the local URL (usually `http://localhost:3000`)

3. Navigate to `/tools/local-seo-keywords.html`

4. Fill out the form and click **"Generate Keywords"**

5. Check the browser console and terminal for any errors

---

## Step 10: Deploy to Vercel

1. Add the environment variables to your Vercel project:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your SBWSK project
   - Go to **Settings** > **Environment Variables**
   - Add each variable:
     - `GOOGLE_ADS_CLIENT_ID`
     - `GOOGLE_ADS_CLIENT_SECRET`
     - `GOOGLE_ADS_DEVELOPER_TOKEN`
     - `GOOGLE_ADS_REFRESH_TOKEN`
     - `GOOGLE_ADS_CUSTOMER_ID`

2. Deploy your changes:
```bash
npm run deploy
```

3. Test the live tool at `https://www.sbwsk.io/tools/local-seo-keywords.html`

---

## Troubleshooting

### Error: "Developer token is not approved"

**Solution:** Your developer token is still pending approval. You can:
- Use a **test Google Ads account** (has "Basic" access level for testing)
- Wait for approval from Google (typically 24-48 hours)

### Error: "User does not have permission to access customer"

**Solution:** Make sure:
- The Google account you authorized has access to the Google Ads account
- The `GOOGLE_ADS_CUSTOMER_ID` is correct (10 digits, no dashes)
- You're using the right customer ID (check in Google Ads top-right corner)

### Error: "Invalid grant" or "Token expired"

**Solution:** Your refresh token may have expired or been revoked:
- Regenerate the refresh token (Step 5)
- Update the `.env` file with the new token
- Redeploy to Vercel

### Error: "Quota exceeded"

**Solution:** Google Ads API has rate limits:
- Free tier: **10,000 operations per day** for developer tokens with "Basic" access
- Implement request caching if needed
- Limit the number of seed keywords per request

### No results or very few keywords returned

**Solution:**
- Try broader seed keywords (e.g., "plumber" instead of "emergency 24/7 plumber Worcester MA")
- Check that your location (city/state) is recognized by Google
- The Google Ads API returns keywords based on actual search data - some niche terms may not have data

---

## API Limits and Quotas

| Access Level | Daily Operations | Use Case |
|--------------|------------------|----------|
| **Basic** | 10,000 | Testing, small businesses, low-volume tools |
| **Standard** | 100,000+ | Production apps with moderate traffic |
| **Unlimited** | No limit | High-volume enterprise applications |

For the SBWSK tool, **Basic** access is sufficient for most small business users.

---

## Adding More Geo Locations

The `/api/keywords.js` file has a `GEO_TARGETS` object with common US locations. To add more:

1. Find the Google Ads Geo Target ID:
   - Use the [Geo Target Constants tool](https://developers.google.com/google-ads/api/data/geotargets)
   - Search for your city/state/country
   - Copy the **Criteria ID**

2. Add it to the `GEO_TARGETS` object in `/api/keywords.js`:

```javascript
const GEO_TARGETS = {
  // ... existing targets
  'Miami': '1015118',  // Example: Miami, FL
  'Seattle': '1019618',  // Example: Seattle, WA
};
```

---

## Security Best Practices

1. ✅ **Never commit `.env` to Git:**
   - Add `.env` to `.gitignore`

2. ✅ **Use environment variables for all credentials**
   - Store in Vercel project settings for production

3. ✅ **Rotate tokens periodically**
   - Regenerate refresh tokens every 6-12 months

4. ✅ **Monitor API usage**
   - Check Google Cloud Console for quota usage
   - Set up billing alerts

5. ✅ **Implement rate limiting** (optional)
   - Add request throttling if you expect high traffic

---

## Resources

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [google-ads-api Node.js Library](https://github.com/Opteo/google-ads-api)
- [Geo Target Constants](https://developers.google.com/google-ads/api/data/geotargets)
- [Google Ads API Forum](https://groups.google.com/g/adwords-api)

---

## Support

If you encounter issues:

1. Check the **browser console** for frontend errors
2. Check the **Vercel Function Logs** for backend errors
3. Review the [Google Ads API error codes](https://developers.google.com/google-ads/api/docs/best-practices/errors)
4. Post in the Google Ads API Forum or contact support

---

**You're all set!** 🎉

Once your environment variables are configured and the Google Ads API is enabled, the Local & General SEO Keyword Generator will provide real, accurate keyword data to help small businesses improve their SEO.
