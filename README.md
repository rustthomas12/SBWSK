# Small Business Website Starter Kit (SBWSK)

A comprehensive web app designed to help small business owners plan, price, and launch their business websites.

## Features

- **Domain Price & Availability Checker** - Check domain availability and view estimated pricing with direct affiliate links to purchase
- **Website Quote Estimator** - Interactive quiz to estimate website project costs
- **Business Name Generator** - Generate creative business names with instant domain checking
- **Website Launch Checklist** - Complete checklist to ensure successful website launch

**Important**: All domain prices shown are **estimates only**. Actual prices may vary. Users should always verify the exact price at the registrar before purchasing.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: Netlify/Vercel (serverless functions)
- **Analytics**: Ready for Google Analytics integration

## Project Structure

```
SBWSK/
├── index.html              # Main landing/dashboard page
├── domain-checker.html     # Domain availability tool
├── quote-estimator.html    # Website quote calculator
├── name-generator.html     # Business name generator
├── checklist.html         # Website launch checklist
├── css/
│   ├── main.css           # Global styles and layout
│   └── components.css     # Reusable component styles
├── js/
│   ├── app.js             # Main application logic
│   ├── domain-checker.js  # Domain checker functionality
│   ├── quote-estimator.js # Quote calculator logic
│   ├── name-generator.js  # Name generation algorithm
│   └── utils.js           # Shared utility functions
├── api/
│   └── submit-lead.js     # Serverless function for lead capture
└── images/                # Logo and assets
```

## Local Development

1. Clone the repository
2. Open `index.html` in your browser, or use a local server:
   ```bash
   npx serve
   ```
3. Navigate to http://localhost:3000

## API Configuration

The Domain Checker uses official provider APIs for real-time pricing and discount detection.

### Quick Start: GoDaddy API (Free & Recommended)

**Get estimated pricing from GoDaddy's official API in 5 minutes:**

📖 **[Complete GoDaddy API Setup Guide →](GODADDY_API_SETUP.md)**

Quick version:
1. Go to https://developer.godaddy.com/keys
2. Create Production API keys (free)
3. Add to environment:
   ```bash
   GODADDY_API_KEY=your_api_key_here
   GODADDY_API_SECRET=your_api_secret_here
   ```

**Note**: Even with API integration, all prices shown are estimates. Actual prices at checkout may vary.

### Namecheap API (Optional)

**Requirements**: 20+ domains OR $50+ account balance

1. Enable API in Namecheap: Profile → API Access
2. Whitelist your server IP
3. Configure environment:
   ```bash
   NAMECHEAP_API_USER=your_username
   NAMECHEAP_API_KEY=your_api_key
   NAMECHEAP_CLIENT_IP=your_server_ip
   ```

### Fallback Pricing System

If APIs are not configured, the system uses **verified standard pricing** from:
- GoDaddy, Namecheap, Hostinger, Bluehost, SiteGround

**Prices are manually verified and updated regularly.**

📖 **[How to Update Prices →](PRICING_UPDATE_GUIDE.md)**

The system automatically:
- Shows when prices were last verified
- Displays cache age for API calls
- Falls back gracefully if APIs fail
- Indicates live vs fallback pricing

## Deployment

### Netlify (Recommended)
1. Connect your GitHub repository
2. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `/`
3. Serverless functions will auto-deploy from `/api` folder
4. Add environment variables in Site Settings → Build & Deploy → Environment

### Vercel
1. Import project from GitHub
2. Framework Preset: Other
3. Root Directory: `/`
4. Add environment variables in Project Settings → Environment Variables

## Monetization

- **Affiliate**: Bluehost hosting affiliate program
- **Lead Generation**: Website design project inquiries

## License

© 2025 - All rights reserved
