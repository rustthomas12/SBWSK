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

## Deployment

### Netlify (Recommended)
1. Connect your GitHub repository
2. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `/`
3. Serverless functions will auto-deploy from `/api` folder

### Vercel
1. Import project from GitHub
2. Framework Preset: Other
3. Root Directory: `/`

## Monetization

- **Affiliate**: Bluehost hosting affiliate program
- **Lead Generation**: Website design project inquiries

## License

© 2025 - All rights reserved
