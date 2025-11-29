# 🚀 Vercel Deployment Guide

## ✅ Conversion Complete!

All PHP files have been successfully converted to Node.js serverless functions for Vercel deployment.

---

## 📦 What Was Converted:

### Configuration Files:
- ✅ `config/products.php` → `config/products.js`

### API Endpoints (Serverless Functions):
- ✅ `api/get-stripe-key.php` → `api/get-stripe-key.js`
- ✅ `api/create-checkout-session.php` → `api/create-checkout-session.js`
- ✅ `api/webhook.php` → `api/webhook.js`
- ✅ `api/verify-session.php` → `api/verify-session.js`
- ✅ `api/download.php` → `api/download.js`

### New Files Created:
- ✅ `package.json` (updated with Stripe dependencies)
- ✅ `vercel.json` (Vercel configuration)
- ✅ This deployment guide

---

## 🔧 Step-by-Step Deployment:

### 1. Install Dependencies Locally (Optional - for testing)

```bash
npm install
```

This installs:
- `stripe` - Stripe SDK for Node.js
- `archiver` - For creating ZIP files
- `dotenv` - For environment variables

---

### 2. Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with your GitHub account (easiest method)
4. Authorize Vercel to access your GitHub

---

### 3. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository: `rustthomas12/SBWSK`
4. Vercel will auto-detect the configuration
5. Click "Deploy"

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

---

### 4. Set Environment Variables in Vercel

**CRITICAL:** You must add your Stripe keys to Vercel!

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add the following variables:

#### Test Mode Variables:
```
STRIPE_PUBLISHABLE_KEY_TEST = pk_test_YOUR_PUBLISHABLE_KEY_HERE

STRIPE_SECRET_KEY_TEST = sk_test_YOUR_SECRET_KEY_HERE

STRIPE_WEBHOOK_SECRET_TEST = whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Note:** Get your actual keys from your `.env` file or [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

#### Live Mode Variables (when ready):
```
STRIPE_PUBLISHABLE_KEY_LIVE = pk_live_your_key_here

STRIPE_SECRET_KEY_LIVE = sk_live_your_key_here

STRIPE_WEBHOOK_SECRET_LIVE = whsec_your_live_webhook_secret_here
```

#### General Variables:
```
SITE_URL = https://www.sbwsk.io

STRIPE_MODE = test
```

**Important:**
- Set each variable for "Production", "Preview", and "Development" environments
- Change `STRIPE_MODE` to `live` when you're ready to accept real payments

---

### 5. Update Webhook URL in Stripe Dashboard

After deployment, you need to update your webhook endpoint:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter your Vercel URL: `https://your-project.vercel.app/api/webhook`
4. Select event: `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET_TEST`

---

### 6. Test Your Deployment

1. Go to your Vercel URL: `https://your-project.vercel.app`
2. Navigate to a product page (e.g., `/templates.html`)
3. Click a "Purchase" button
4. Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
5. Complete the checkout
6. Verify you're redirected to the success page

---

### 7. Deploy to Custom Domain (Optional)

#### If you want to use sbwsk.io:

1. In Vercel Dashboard → "Settings" → "Domains"
2. Click "Add Domain"
3. Enter: `sbwsk.io`
4. Vercel will show you DNS records to add
5. Go to your domain registrar (where you bought sbwsk.io)
6. Add the DNS records Vercel provided:
   - Type: `A` Record
   - Name: `@`
   - Value: `76.76.21.21` (Vercel's IP)

   OR

   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

7. Wait 5-60 minutes for DNS propagation
8. Update `SITE_URL` environment variable to `https://sbwsk.io`
9. Update webhook URL in Stripe to `https://sbwsk.io/api/webhook`

---

## 🧪 Testing Checklist:

- [ ] All pages load correctly
- [ ] Purchase buttons work on all product pages
- [ ] Stripe checkout opens when clicking "Purchase"
- [ ] Test payment succeeds (card: 4242 4242 4242 4242)
- [ ] Redirected to success page after payment
- [ ] Download links work on success page
- [ ] ZIP file downloads correctly
- [ ] Webhook receives checkout.session.completed events (check Vercel logs)

---

## 📊 Monitoring and Logs:

### View Serverless Function Logs:

1. Go to Vercel Dashboard
2. Click on your project
3. Click "Functions" tab
4. Click on any function to see logs
5. Check for errors or successful executions

### Common Issues:

**Issue:** "Stripe not defined" error
- **Fix:** Make sure `stripe` is in package.json dependencies
- **Fix:** Redeploy after adding dependencies

**Issue:** "Environment variable not found"
- **Fix:** Check all environment variables are set in Vercel
- **Fix:** Make sure they're enabled for all environments (Production, Preview, Development)

**Issue:** Webhook signature verification fails
- **Fix:** Copy the correct webhook secret from Stripe
- **Fix:** Make sure it's set as `STRIPE_WEBHOOK_SECRET_TEST` in Vercel

**Issue:** Files not found in ZIP download
- **Fix:** Check that `copy-kit-templates/` folder is included in git
- **Fix:** Verify `includeFiles` in vercel.json

---

## 🎉 You're Live!

Once everything is working:

1. Test all products thoroughly
2. Switch to live mode:
   - Update `STRIPE_MODE` to `live` in Vercel
   - Add live Stripe keys to Vercel
   - Create live webhook in Stripe Dashboard
3. Start accepting real payments! 💰

---

## 📞 Support:

**Vercel Issues:**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

**Stripe Issues:**
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

---

## 🔄 Future Updates:

To deploy updates:

1. Make changes to your code locally
2. Push to GitHub: `git push`
3. Vercel automatically deploys from GitHub
4. Check deployment status in Vercel Dashboard

**That's it!** 🚀

Your payment system is now running on Vercel's serverless infrastructure!
