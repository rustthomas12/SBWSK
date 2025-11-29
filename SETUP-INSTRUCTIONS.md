# 🚀 SIMPLE SETUP - Just Send Me 3 Things!

Everything is now automated! You just need to provide 3 pieces of information.

## What You Need to Send Me:

### 1. **Your Stripe Publishable Key (TEST)**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy the key that starts with `pk_test_...`

### 2. **Your Stripe Secret Key (TEST)**
   - Same page as above
   - Click "Reveal test key"
   - Copy the key that starts with `sk_test_...`
   - ⚠️ **IMPORTANT:** Send this in a secure way, don't post publicly

### 3. **Your Website URL**
   - What's your domain? (e.g., `https://sbwsk.com` or `https://yoursite.com`)

---

## Automated Setup (Option 1) - Easiest

Just run this one command and paste your keys when prompted:

```bash
cd /home/rustt/projects/New_Website/SBWSK
./setup.sh
```

It will:
✅ Create configuration file
✅ Install Stripe library
✅ Set up directories
✅ Tell you next steps

---

## Manual Setup (Option 2) - If you prefer

### Step 1: Install Stripe Library
```bash
cd /home/rustt/projects/New_Website/SBWSK
composer require stripe/stripe-php
```

### Step 2: Create .env File
```bash
cp .env.example .env
nano .env
```

### Step 3: Update These Lines in .env
```
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY_TEST=sk_test_YOUR_KEY_HERE
SITE_URL=https://yourdomain.com
```

### Step 4: Save and Create Logs
```bash
mkdir -p logs
chmod 755 logs
```

---

## After Setup: Configure Webhook

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter: `https://yourdomain.com/api/webhook.php`
4. Select event: `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add to `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET_TEST=whsec_your_secret_here
   ```

---

## Test It!

1. Go to: `https://yourdomain.com/website-copy-kit.html`
2. Click "Purchase Now for $17"
3. Use test card: `4242 4242 4242 4242`
4. Any future expiry, any CVC
5. Complete purchase
6. Should redirect to download page ✅

---

## What I Need From You:

**Just reply with:**

```
Publishable Key: pk_test_...
Secret Key: sk_test_...
Domain: https://...
```

And I'll configure everything for you!

Or run `./setup.sh` yourself if you prefer to do it.

---

## Security Notes:

✅ Your secret keys are stored in `.env` (not committed to git)
✅ `.gitignore` prevents accidental commits
✅ Server-side config keeps keys secure
✅ Never expose secret keys in browser code

---

## Going Live Later:

When you're ready to accept real payments:

1. Get live keys (pk_live_ and sk_live_)
2. Update `.env` with live keys
3. Change `STRIPE_MODE=live`
4. Set up live webhook
5. Done! 🎉

---

That's it! Everything else is already set up and ready to go.
