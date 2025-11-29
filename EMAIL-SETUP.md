# 📧 Email Delivery Setup Guide

## Overview
This guide explains how to set up automatic email delivery with file attachments for the Copy Kit purchases.

---

## Option 1: Resend (Recommended - Free Tier Available)

### Why Resend?
- ✅ Free tier: 3,000 emails/month
- ✅ Simple API
- ✅ Great deliverability
- ✅ Easy Vercel integration
- ✅ Attachment support

### Setup Steps:

1. **Sign up for Resend**
   - Go to: https://resend.com/signup
   - Create a free account
   - Verify your email

2. **Get your API Key**
   - Dashboard → API Keys
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Add API Key to Vercel**
   ```bash
   # Run this command in your project directory:
   printf "YOUR_RESEND_API_KEY" | vercel env add RESEND_API_KEY production
   ```

4. **Verify Your Domain** (Optional but recommended for better deliverability)
   - Resend Dashboard → Domains
   - Add your domain (sbwsk.io)
   - Add the DNS records they provide to your domain registrar
   - Wait for verification (usually 24-48 hours)

5. **Install Resend Package**
   ```bash
   npm install resend
   ```

6. **Update package.json**
   Add to dependencies:
   ```json
   "resend": "^2.0.0"
   ```

7. **Deploy the changes**
   ```bash
   git add package.json package-lock.json
   git commit -m "Add Resend for email delivery"
   git push origin main
   ```

---

## Option 2: SendGrid

### Setup Steps:

1. **Sign up for SendGrid**
   - Go to: https://signup.sendgrid.com
   - Free tier: 100 emails/day

2. **Get API Key**
   - Settings → API Keys → Create API Key
   - Give it "Full Access" or "Mail Send" permissions

3. **Add to Vercel**
   ```bash
   printf "YOUR_SENDGRID_API_KEY" | vercel env add SENDGRID_API_KEY production
   ```

4. **Install Package**
   ```bash
   npm install @sendgrid/mail
   ```

---

## Option 3: AWS SES (For High Volume)

Best for sending 10,000+ emails/month. More complex setup but very reliable.

---

## Implementation

Once you have your email service set up, the webhook.js file will automatically send emails with purchase confirmations.

### Current Status:
- ✅ Webhook handler is ready (`api/webhook.js`)
- ✅ Email template is commented out and ready to use
- ⏳ Waiting for email service API key

### To Enable Emails:

1. **Choose an email service** (Resend recommended)
2. **Add the API key** to Vercel environment variables
3. **Uncomment the email code** in `api/webhook.js`
4. **Test with a purchase**

---

## Email Features Ready to Use:

### For Copy Kit Purchases:
- ✅ Professional email template
- ✅ Download link included
- ✅ Order confirmation
- ✅ Responsive HTML design
- ✅ Links to all bonus tools

### For Logo Purchases:
- ✅ Order confirmation
- ✅ Next steps outlined
- ✅ Contact information

---

## Testing Email Delivery:

### Before Going Live:
1. Make a test purchase using Stripe test card: `4242 4242 4242 4242`
2. Check that email arrives
3. Verify download link works
4. Check email formatting on mobile

### Monitoring:
- Check Resend/SendGrid dashboard for delivery status
- Monitor bounce rates
- Check spam complaints

---

## Email Best Practices:

✅ **Do:**
- Use a verified domain (tom@lowlightdigital.com vs support@vercel.app)
- Include unsubscribe link for marketing emails
- Keep transactional emails simple and clear
- Test on multiple email clients

❌ **Don't:**
- Send marketing emails without permission
- Use spammy subject lines
- Forget to include order details
- Send from a no-reply address

---

## Troubleshooting:

### Emails Not Sending?
1. Check API key is correct in Vercel dashboard
2. Verify webhook is being triggered (check Stripe dashboard)
3. Check Vercel function logs
4. Verify domain is configured correctly

### Emails Going to Spam?
1. Verify your domain
2. Set up SPF and DKIM records
3. Avoid spam trigger words
4. Don't send too many emails at once

---

## Next Steps:

1. [ ] Choose email service (Resend recommended)
2. [ ] Sign up and get API key
3. [ ] Add API key to Vercel
4. [ ] Install email package
5. [ ] Update webhook.js to enable emails
6. [ ] Test with a purchase
7. [ ] Verify domain for better deliverability

---

## Quick Start Command (Resend):

```bash
# 1. Sign up at resend.com and get API key

# 2. Add to Vercel:
printf "re_YOUR_API_KEY_HERE" | vercel env add RESEND_API_KEY production

# 3. Install package:
npm install resend

# 4. Commit and deploy:
git add package.json package-lock.json
git commit -m "Add Resend for email delivery"
git push origin main

# 5. Enable emails in webhook.js (uncomment email sending code)
```

---

## Need Help?

If you need assistance setting up email delivery, I can:
1. Help you set up Resend account
2. Configure the webhook to send emails
3. Create custom email templates
4. Set up domain verification

Just let me know!

---

© 2025 SBWSK - Email Setup Guide
