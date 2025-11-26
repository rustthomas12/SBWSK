# SBWSK Deployment Guide

## GitHub Setup

Your project is already committed to Git. To push to GitHub:

### Option 1: Using GitHub Web Interface
1. Go to https://github.com/new
2. Create a new repository named "SBWSK"
3. DO NOT initialize with README, .gitignore, or license
4. Then run these commands:

```bash
cd /home/rustt/projects/New_Website/SBWSK
git remote add origin https://github.com/YOUR_USERNAME/SBWSK.git
git push -u origin main
```

### Option 2: Using GitHub CLI (if installed)
```bash
cd /home/rustt/projects/New_Website/SBWSK
gh repo create SBWSK --public --source=. --push
```

---

## Deployment Options

### Option 1: Netlify (Recommended - FREE)

1. **Sign up at [netlify.com](https://netlify.com)**

2. **Connect GitHub:**
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select the SBWSK repository

3. **Build settings:**
   - Build command: (leave empty)
   - Publish directory: `/`
   - Click "Deploy site"

4. **Configure serverless functions:**
   - Functions are auto-detected in `/api` folder
   - No additional setup needed

5. **Custom domain (optional):**
   - Site settings → Domain management
   - Add your custom domain

6. **Environment variables (if using email service):**
   - Site settings → Environment variables
   - Add `SENDGRID_API_KEY` or similar

**Your site will be live at:** `https://your-site-name.netlify.app`

---

### Option 2: Vercel (Also FREE)

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Import project:**
   - Click "New Project"
   - Import from GitHub
   - Select SBWSK repository

3. **Configure:**
   - Framework Preset: Other
   - Root Directory: `/`
   - Click "Deploy"

4. **Serverless functions:**
   - Automatically detected in `/api` folder

**Your site will be live at:** `https://sbwsk.vercel.app`

---

## Local Development

### Quick Start
```bash
cd /home/rustt/projects/New_Website/SBWSK

# Option 1: Using Python
python3 -m http.server 8000

# Option 2: Using npx serve
npx serve

# Then open: http://localhost:8000 or http://localhost:3000
```

### Testing the serverless function locally:
```bash
node api/submit-lead.js
```

---

## Post-Deployment Setup

### 1. Update Email Address
Replace `your-email@example.com` in these files:
- `js/app.js` (line with mailto:)
- `js/quote-estimator.js` (line with mailto:)

### 2. Set Up Email Service (Optional but Recommended)

For production form submissions, integrate SendGrid:

```bash
npm install @sendgrid/mail
```

In `api/submit-lead.js`, uncomment the SendGrid code and add your API key as an environment variable.

### 3. Analytics Setup

Add Google Analytics:
1. Create a GA4 property at analytics.google.com
2. Add the tracking code to the `<head>` of each HTML file

### 4. Custom Domain Setup

**For Bluehost hosting:**
1. Upload all files via FTP or File Manager
2. Point domain DNS to your hosting
3. Install SSL certificate (free with Bluehost)

---

## File Structure Reference

```
SBWSK/
├── index.html              # Main landing page
├── domain-checker.html     # Domain availability tool
├── quote-estimator.html    # Interactive quote calculator
├── name-generator.html     # Business name generator
├── checklist.html         # Website launch checklist
├── css/
│   ├── main.css           # Global styles
│   └── components.css     # Component styles
├── js/
│   ├── app.js             # Main app logic
│   ├── domain-checker.js  # Domain checker functionality
│   ├── quote-estimator.js # Quote calculator logic
│   ├── name-generator.js  # Name generation algorithm
│   ├── checklist.js       # Checklist functionality
│   └── utils.js           # Shared utilities
├── api/
│   └── submit-lead.js     # Serverless function for forms
└── package.json
```

---

## Customization

### Update Affiliate Links
Current affiliate link: `https://bluehost.sjv.io/DyaJob`

Replace in these files:
- index.html
- domain-checker.html
- quote-estimator.html
- checklist.html

### Adjust Pricing
Edit pricing in `js/quote-estimator.js`:
- Page count pricing (lines 180-185)
- Design level multipliers (lines 188-193)
- Feature add-on prices (lines 196-203)

### Add More Industries
Edit `js/name-generator.js` to add more business types in the `getIndustryTerms()` function.

---

## Support & Next Steps

### Immediate Next Steps:
1. ✅ Push to GitHub
2. ✅ Deploy to Netlify or Vercel
3. ✅ Update email addresses
4. ✅ Test all forms and tools
5. ✅ Add Google Analytics
6. ✅ Set up custom domain

### Future Enhancements:
- Connect real domain availability API (Namecheap, GoDaddy)
- Add blog section for SEO content
- Create testimonials section
- Add live chat widget
- Build email drip campaigns for leads
- A/B test different CTAs and pricing

---

## Questions?

- **Documentation:** See README.md
- **Issues:** Check browser console for errors
- **Forms not working?** Verify serverless functions are deployed

Good luck with your Small Business Website Starter Kit! 🚀
