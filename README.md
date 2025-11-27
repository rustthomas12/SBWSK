# Small Business Website Starter Kit (SBWSK)

A comprehensive web app designed to help small business owners plan, price, and launch their business websites.

## Features

- **Domain Price & Availability Checker** - Find and check domain availability with direct affiliate links to purchase
- **Website Quote Estimator** - Interactive quiz to estimate website project costs
- **Business Name Generator** - Generate creative business names with instant domain checking
- **Website Launch Checklist** - Complete checklist to ensure successful website launch

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

The Domain Checker uses official provider APIs for real-time pricing and discount detection. Configure these environment variables for accurate pricing:

### GoDaddy API (Recommended)
Get official real-time prices from GoDaddy:

1. **Create API Keys**:
   - Go to https://developer.godaddy.com/keys
   - Sign in with your GoDaddy account (free account works)
   - Click "Create New API Key"
   - Select "Production" environment
   - Copy your API Key and Secret

2. **Configure Environment Variables**:
   ```bash
   GODADDY_API_KEY=your_api_key_here
   GODADDY_API_SECRET=your_api_secret_here
   ```

### Namecheap API (Optional)
Get real-time prices from Namecheap:

1. **Requirements**:
   - Active Namecheap account with $50+ balance
   - Minimum 20 domains in account OR $50+ account balance

2. **Enable API Access**:
   - Log in to Namecheap
   - Go to Profile → Tools → API Access
   - Enable API access
   - Whitelist your server IP address

3. **Configure Environment Variables**:
   ```bash
   NAMECHEAP_API_USER=your_username
   NAMECHEAP_API_KEY=your_api_key
   ```

### Fallback Pricing
If API keys are not configured, the system uses verified standard pricing:
- GoDaddy: Standard published rates
- Hostinger: Current promotional pricing
- Bluehost: Free with hosting plans
- SiteGround: Standard transparent pricing

The system detects discounts, promotions, and special offers automatically.

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
