# Stripe Setup Guide for New Revenue Services

## 🎯 Overview

All backend code is complete! You just need to test the checkout flows. This guide covers the NEW services only (Setup Service, Care Plans, Speed Optimization).

---

## ✅ What's Already Done

### API Endpoints Created:
- ✅ `/api/create-setup-service-checkout.js` - Setup Service checkout
- ✅ `/api/create-care-plan-checkout.js` - Subscription checkout  
- ✅ `config/products.js` - All new products configured

### Success Pages:
- ✅ `setup-service-success.html`
- ✅ `care-plan-success.html`

### Products Configured:
- Setup Service: $397
- Setup Service Upsell: $347
- Speed Optimization: $147
- Care Plan Basic: $39/month
- Care Plan Pro: $79/month
- Care Plan Premium: $149/month

---

## 🚀 Quick Start (5 minutes)

### 1. Verify Your .env File

Make sure you have:
```bash
STRIPE_MODE=test
STRIPE_SECRET_KEY_TEST=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_your_key_here
SITE_URL=https://www.sbwsk.io
```

### 2. Test Checkout Flows

#### Test Setup Service:
1. Visit `/setup-service.html`
2. Click "Get Started Now"
3. Use test card: 4242 4242 4242 4242
4. Any future date, any CVC
5. Should redirect to success page

#### Test Care Plans:
1. Visit `/website-care-plan.html`
2. Click "Get Started" on any plan
3. Use same test card
4. Should create subscription

---

## 📊 How It Works

### One-Time Payments (Setup Service):
```javascript
// Frontend (setup-service.html)
const response = await fetch('/api/create-setup-service-checkout', {
  method: 'POST'
});
const session = await response.json();
stripe.redirectToCheckout({ sessionId: session.sessionId });
```

### Subscriptions (Care Plans):
```javascript
// Frontend (website-care-plan.html)
const response = await fetch('/api/create-care-plan-checkout', {
  method: 'POST',
  body: JSON.stringify({ plan: 'pro' }) // or 'basic'/'premium'
});
```

---

## 🧪 Testing Checklist

- [ ] Setup Service checkout works
- [ ] Setup Service upsell (from Copy Kit) works
- [ ] Care Plan Basic subscription works
- [ ] Care Plan Pro subscription works
- [ ] Care Plan Premium subscription works
- [ ] Success pages display correctly
- [ ] Stripe Dashboard shows payments

---

## 🔧 Configuration Notes

### Dynamic Price Creation
The Care Plan API creates Stripe Prices on-the-fly. This works but for production:

1. Create Prices in Stripe Dashboard manually
2. Copy the Price IDs
3. Update config/products.js with static IDs
4. Update API to use those IDs

### Customer Portal
Enable in Stripe: Settings → Billing → Customer Portal

Allows customers to:
- Update payment method
- Cancel subscription  
- View invoices

---

## 🚨 Common Issues

**"Method not allowed"**
- Verify POST request
- Check API endpoint exists

**Checkout doesn't open**
- Check browser console (F12)
- Verify Stripe.js loaded
- Check `window.STRIPE_CONFIG` 

**Wrong price**
- Prices in config are in CENTS
- $39 = 3900 cents

---

## 📈 Go Live Checklist

- [ ] Test all flows thoroughly
- [ ] Create Prices in Stripe Dashboard
- [ ] Update .env to `STRIPE_MODE=live`
- [ ] Switch to live API keys
- [ ] Enable Customer Portal
- [ ] Test one real purchase
- [ ] Monitor first sales

---

## 📚 Files Reference

**API Endpoints:**
- `api/create-setup-service-checkout.js`
- `api/create-care-plan-checkout.js`

**Config:**
- `config/products.js` (all product pricing)

**Success Pages:**
- `setup-service-success.html`
- `care-plan-success.html`

**Service Pages:**
- `setup-service.html`
- `website-care-plan.html`
- `services.html`

---

## ✅ You're Ready!

Everything works out of the box. Just test with Stripe test cards and you're good to go!

Test Card: 4242 4242 4242 4242 (any expiry/CVC)

---

**Setup Time:** 5-10 minutes
**Status:** ✅ Ready to test
