# SBWSK Revenue Services - Testing Checklist

## 🎯 Deployment Status
✅ **Live Site:** https://www.sbwsk.io
✅ **Vercel Deployment:** https://sbwsk-mcwusemku-thomas-rusts-projects.vercel.app
✅ **Last Deployed:** $(date)

---

## 🧪 Stripe Test Card Information

**Test Card Number:** `4242 4242 4242 4242`
**Expiry:** Any future date (e.g., 12/25)
**CVC:** Any 3 digits (e.g., 123)
**ZIP:** Any 5 digits (e.g., 12345)

---

## ✅ Testing Checklist

### 1. Setup Service ($397)

**Test URL:** https://www.sbwsk.io/setup-service.html

- [ ] Page loads correctly
- [ ] Navigation includes "Services" menu item
- [ ] "Get Started Now" button (top) triggers checkout
- [ ] "Get Started Now" button (bottom) triggers checkout
- [ ] Stripe checkout modal opens
- [ ] Test card processes successfully
- [ ] Redirects to `setup-service-success.html`
- [ ] Success page displays correctly
- [ ] Care Plan upsell is visible on success page

**What to Check:**
- Price displays as $397
- All sections load properly (What's Included, How It Works, FAQ)
- Error handling shows specific messages (not generic)

---

### 2. Website Care Plans (Subscriptions)

**Test URL:** https://www.sbwsk.io/website-care-plan.html

#### Basic Plan ($39/month)
- [ ] "Get Started" button triggers checkout
- [ ] Stripe shows correct price: $39.00/month
- [ ] Test card processes successfully
- [ ] Redirects to `care-plan-success.html?plan=basic`
- [ ] Success page displays correctly
- [ ] Renewal date shows (30 days from now)

#### Pro Plan ($79/month)
- [ ] "Get Started" button triggers checkout
- [ ] Stripe shows correct price: $79.00/month
- [ ] Test card processes successfully
- [ ] Redirects to `care-plan-success.html?plan=pro`
- [ ] Premium features section is visible on success page

#### Premium Plan ($149/month)
- [ ] "Get Started" button triggers checkout
- [ ] Stripe shows correct price: $149.00/month
- [ ] Test card processes successfully
- [ ] Redirects to `care-plan-success.html?plan=premium`
- [ ] Premium features section is visible on success page

**What to Check:**
- All three plan cards display correctly
- "Most Popular" badge shows on Pro plan
- Comparison of features is clear
- FAQ section loads properly

---

### 3. Speed Optimization Service ($147)

**Test URL:** https://www.sbwsk.io/website-speed-check.html

- [ ] Page loads correctly
- [ ] Free speed check tool works (top section)
- [ ] Scroll to "Speed Optimization Service" section
- [ ] "Get Started - $147" button triggers checkout
- [ ] Stripe shows correct price: $147.00
- [ ] Test card processes successfully
- [ ] Redirects to `speed-optimization-success.html`
- [ ] Success page displays correctly
- [ ] Care Plan upsell is visible on success page

**What to Check:**
- Speed check tool functionality (optional test)
- Optimization service pricing clear ($147)
- Before/after guarantee messaging visible

---

## 🛠️ Additional Testing

### Navigation Testing
- [ ] "Services" link appears in main navigation on all pages
- [ ] Services link points to `services.html`
- [ ] Services overview page lists all services correctly

### Success Pages
- [ ] `setup-service-success.html` - Timeline shows 3 steps
- [ ] `care-plan-success.html` - Shows subscription renewal date
- [ ] `speed-optimization-success.html` - Shows 4-step process

### Error Handling
- [ ] If Stripe API fails, shows specific error message
- [ ] If `window.STRIPE_CONFIG` not loaded, shows loading message
- [ ] Network errors display helpful message

---

## 🔍 Stripe Dashboard Verification

After testing, check your Stripe Test Dashboard:

**Dashboard URL:** https://dashboard.stripe.com/test/payments

Expected to see:
- [ ] 3 one-time payments (Setup Service, Speed Optimization, Setup Service Upsell)
- [ ] 3 subscriptions (Basic, Pro, Premium Care Plans)
- [ ] All metadata correctly set (product, service_type, plan)
- [ ] Customer information collected (email, billing address, phone)

---

## 📊 Testing Results Template

```
Date: ___________
Tester: ___________

Setup Service: ✅ / ❌
Care Plan Basic: ✅ / ❌
Care Plan Pro: ✅ / ❌
Care Plan Premium: ✅ / ❌
Speed Optimization: ✅ / ❌

Issues Found:
1.
2.
3.

Notes:
```

---

## 🚀 Production Deployment Checklist

Before going live with real payments:

- [ ] Test all flows thoroughly in test mode
- [ ] Create Products in Stripe Dashboard (live mode)
- [ ] Create Prices in Stripe Dashboard (live mode)
- [ ] Update `config/products.js` with live Price IDs
- [ ] Update `.env`: `STRIPE_MODE=live`
- [ ] Update `.env` with live API keys
- [ ] Set up Stripe Webhook endpoint
- [ ] Enable Stripe Customer Portal
- [ ] Test ONE real small payment
- [ ] Monitor first real transactions
- [ ] Set up email notifications (optional)

---

## 📝 Notes

- All checkout flows now have improved error handling
- Frontend JavaScript properly validates API responses
- Success pages include strategic upsells
- Navigation is consistent across all service pages

**Last Updated:** $(date)
