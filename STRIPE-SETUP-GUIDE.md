# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payments for the Website Copy Kit product.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Stripe Account Setup](#stripe-account-setup)
3. [Install Stripe PHP Library](#install-stripe-php-library)
4. [Configure API Keys](#configure-api-keys)
5. [Test the Integration](#test-the-integration)
6. [Go Live](#go-live)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- PHP 7.4 or higher
- Composer (PHP package manager)
- A Stripe account
- SSL certificate (HTTPS) for your website
- Access to your web server

---

## Stripe Account Setup

### 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" to create an account
3. Complete the registration process
4. Verify your email address

### 2. Get Your API Keys

1. Log in to your Stripe Dashboard
2. Go to **Developers** → **API keys**
3. You'll see two types of keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)
4. Keep these keys secure - you'll need them in the next steps

**IMPORTANT:** Never commit your secret keys to version control!

---

## Install Stripe PHP Library

### Using Composer (Recommended)

1. Navigate to your SBWSK directory:
   ```bash
   cd /home/rustt/projects/New_Website/SBWSK
   ```

2. Install the Stripe PHP library:
   ```bash
   composer require stripe/stripe-php
   ```

3. This will create a `vendor/` directory with the Stripe library.

### Without Composer (Alternative)

If you don't have Composer, you can download the library manually:

1. Download from: https://github.com/stripe/stripe-php/releases
2. Extract to your project directory
3. Require the autoloader in your PHP files

---

## Configure API Keys

You need to update your API keys in **4 files**:

### 1. Update `js/stripe-checkout.js`

**Line 4:** Replace the publishable key
```javascript
const stripePublishableKey = 'pk_test_YOUR_ACTUAL_KEY_HERE';
```

Example:
```javascript
const stripePublishableKey = 'pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz123456789';
```

### 2. Update `api/create-checkout-session.php`

**Line 23:** Replace the secret key
```php
\Stripe\Stripe::setApiKey('sk_test_YOUR_ACTUAL_KEY_HERE');
```

Example:
```php
\Stripe\Stripe::setApiKey('sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz123456789ABCDEFG');
```

### 3. Update `api/webhook.php`

**Line 10:** Replace the secret key
```php
\Stripe\Stripe::setApiKey('sk_test_YOUR_ACTUAL_KEY_HERE');
```

**Line 13:** Replace the webhook secret (we'll get this in step 5)
```php
$endpoint_secret = 'whsec_YOUR_WEBHOOK_SECRET_HERE';
```

### 4. Update `api/verify-session.php`

**Line 10:** Replace the secret key
```php
\Stripe\Stripe::setApiKey('sk_test_YOUR_ACTUAL_KEY_HERE');
```

### 5. Update `copy-kit-success.html`

**Line 236:** Replace the publishable key
```javascript
const stripe = Stripe('pk_test_YOUR_ACTUAL_KEY_HERE');
```

---

## Set Up Webhook

Webhooks allow Stripe to notify your server when a payment succeeds.

### 1. Create Webhook Endpoint

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhook.php
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **"Add endpoint"**

### 2. Get Webhook Signing Secret

1. After creating the endpoint, click on it
2. Find **"Signing secret"** section
3. Click **"Reveal"** to see the secret (starts with `whsec_`)
4. Copy this secret and update `api/webhook.php` line 13

---

## Configure File Permissions

Make sure your server can write to the logs directory:

```bash
mkdir -p logs
chmod 755 logs
chmod 644 copy-kit-templates/*
```

---

## Test the Integration

### Test Mode

By default, you're using **test mode** keys (starting with `pk_test_` and `sk_test_`).

### Test Credit Cards

Use these test card numbers:

| Card Number      | Result |
|------------------|--------|
| 4242424242424242 | Success |
| 4000000000000002 | Card declined |
| 4000002500003155 | Requires authentication |

**Expiry:** Any future date
**CVC:** Any 3 digits
**ZIP:** Any 5 digits

### Testing Process

1. Go to `website-copy-kit.html`
2. Click "Purchase Now for $17"
3. You should be redirected to Stripe Checkout
4. Use a test card number
5. Complete the payment
6. You should be redirected to `copy-kit-success.html`
7. Download links should appear

### Check Test Payments

1. Go to **Stripe Dashboard** → **Payments**
2. You should see your test payment
3. Check the webhook logs: **Developers** → **Webhooks** → **Your endpoint**

---

## Go Live

Once testing is complete, switch to live mode:

### 1. Get Live API Keys

1. In Stripe Dashboard, toggle to **Live mode** (top right)
2. Go to **Developers** → **API keys**
3. Copy your **live** publishable and secret keys

### 2. Update All Files

Replace all `pk_test_` and `sk_test_` keys with `pk_live_` and `sk_live_` keys in:
- `js/stripe-checkout.js`
- `api/create-checkout-session.php`
- `api/webhook.php`
- `api/verify-session.php`
- `copy-kit-success.html`

### 3. Create Live Webhook

1. Toggle to **Live mode** in Stripe Dashboard
2. Go to **Developers** → **Webhooks**
3. Create a new webhook endpoint (same URL as test)
4. Get the new signing secret
5. Update `api/webhook.php` with the live webhook secret

### 4. Activate Your Stripe Account

Before going live, you need to activate your account:

1. **Stripe Dashboard** → **Activate your account**
2. Provide business information
3. Add bank account details
4. Complete identity verification

---

## Email Configuration (Optional)

The webhook sends an email after successful purchase. Configure your server's PHP mail settings:

### Option 1: Use SMTP

Install PHPMailer:
```bash
composer require phpmailer/phpmailer
```

Update `api/webhook.php` to use PHPMailer instead of PHP's `mail()` function.

### Option 2: Use SendGrid/Mailgun

For better deliverability, use a transactional email service:
- **SendGrid**: https://sendgrid.com
- **Mailgun**: https://mailgun.com
- **Amazon SES**: https://aws.amazon.com/ses/

---

## Security Checklist

Before going live, ensure:

- [ ] SSL certificate is installed (HTTPS)
- [ ] API keys are not committed to version control
- [ ] Webhook signature verification is enabled
- [ ] File permissions are correctly set
- [ ] Error reporting is disabled in production
- [ ] `.env` file is used for sensitive data (recommended)
- [ ] Server is running PHP 7.4+
- [ ] Composer dependencies are up to date

---

## Monitoring & Maintenance

### Check Sales

- **Stripe Dashboard** → **Payments** to see all transactions
- **Stripe Dashboard** → **Reports** for detailed analytics

### Monitor Webhooks

- **Developers** → **Webhooks** → Click your endpoint
- View recent webhook deliveries and any failures

### Download Logs

Check these files for issues:
```
logs/purchases.log    # All purchases
logs/downloads.log    # All downloads
```

---

## Troubleshooting

### Payment Button Doesn't Work

**Check:**
1. Browser console for JavaScript errors (F12)
2. Verify publishable key is correct in `stripe-checkout.js`
3. Make sure Stripe.js is loaded: `<script src="https://js.stripe.com/v3/"></script>`

### "Invalid Session" Error

**Check:**
1. Secret key in `api/create-checkout-session.php` is correct
2. Composer installed Stripe library: `vendor/stripe/stripe-php/`
3. PHP errors: Enable error reporting temporarily

### Webhook Not Firing

**Check:**
1. Webhook URL is accessible publicly
2. Signing secret matches Stripe Dashboard
3. Events are selected in webhook configuration
4. Check webhook logs in Stripe Dashboard

### Download Links Not Working

**Check:**
1. Template files exist in `copy-kit-templates/`
2. File permissions allow reading
3. Session verification passes in `verify-session.php`

### Email Not Sending

**Check:**
1. PHP's `mail()` function is configured on server
2. SPF and DKIM records for your domain
3. Consider using an SMTP service for reliability

---

## File Structure

```
SBWSK/
├── api/
│   ├── create-checkout-session.php  # Creates Stripe session
│   ├── webhook.php                   # Handles payment events
│   ├── verify-session.php            # Verifies payment
│   └── download.php                  # Provides ZIP download
├── copy-kit-templates/
│   ├── 1-homepage-template.txt
│   ├── 2-about-page-template.txt
│   ├── 3-services-page-template.txt
│   ├── 4-contact-page-template.txt
│   ├── 5-seo-meta-tags-template.txt
│   └── README.txt
├── js/
│   └── stripe-checkout.js            # Frontend Stripe code
├── logs/
│   ├── purchases.log
│   └── downloads.log
├── vendor/                           # Composer dependencies
├── website-copy-kit.html             # Product page
└── copy-kit-success.html             # Download page
```

---

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe PHP Library**: https://github.com/stripe/stripe-php
- **Stripe API Reference**: https://stripe.com/docs/api
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe Webhooks Guide**: https://stripe.com/docs/webhooks

---

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Test with test credit cards
3. ✅ Verify webhook is working
4. ✅ Test email delivery
5. ✅ Activate Stripe account
6. ✅ Switch to live keys
7. ✅ Make a real purchase to test
8. ✅ Monitor for the first few sales

---

## Quick Reference: API Keys Location

| File | Line | What to Replace |
|------|------|----------------|
| `js/stripe-checkout.js` | 4 | Publishable key |
| `api/create-checkout-session.php` | 23 | Secret key |
| `api/webhook.php` | 10 | Secret key |
| `api/webhook.php` | 13 | Webhook secret |
| `api/verify-session.php` | 10 | Secret key |
| `api/download.php` | 10 | Secret key |
| `copy-kit-success.html` | 236 | Publishable key |

---

**Need help?** Contact Stripe Support or check their extensive documentation.

Good luck with your launch! 🚀
