# How to Update Domain Prices

Your site uses **manually verified pricing** for accuracy. This is more reliable than scraping because provider websites use JavaScript to load prices dynamically.

## Quick Update (5 Minutes)

### 1. Check Current Prices

Visit each provider's website and note their current .com prices:

- **Hostinger**: https://www.hostinger.com/domain-name-search
- **GoDaddy**: https://www.godaddy.com/domains
- **SiteGround**: https://www.siteground.com/domain-names
- **Bluehost**: https://www.bluehost.com/domains (free with hosting)

### 2. Edit pricing-config.json

Open `pricing-config.json` and update the prices:

```json
{
  "Hostinger": {
    ".com": {
      "firstYear": 0.99,  ← Update this
      "renewal": 13.99,   ← Update this
      "promoPrice": 0.99,
      "regularPrice": 13.99
    }
  }
}
```

### 3. Commit and Push

```bash
git add pricing-config.json
git commit -m "Update domain prices for January 2025"
git push
```

Vercel will automatically redeploy with the new prices (takes ~1 minute).

## What Each Price Means

- **firstYear**: What customers pay in year 1 (often discounted)
- **renewal**: What they pay annually after year 1
- **promoPrice**: Current promotional/sale price (if any)
- **regularPrice**: Normal price without promotions

## Price Verification Tips

### Hostinger
- Look for "First year" pricing (often $0.99 - $4.99)
- They frequently have 99% off promotions
- Renewal prices are typically $13.99 - $15.99

### GoDaddy
- Check for "Introductory" or "First year" rates
- Promotions are common ($0.99 - $2.99 first year)
- Renewals typically $21.99+

### SiteGround
- Consistent pricing (no gimmicks)
- Usually $15.95 - $19.95 for .com
- Renewal prices close to first-year prices

### Bluehost
- Domains are FREE with hosting plans
- Keep "firstYear": 0 in config
- Update renewal prices (usually $24.19)

## When to Update

**Monthly is fine** - domain prices don't change frequently. Update when:
- You notice a major promotion on provider sites
- A customer reports incorrect pricing
- Beginning of a new quarter/year

## Example: Full Update

1. Visit Hostinger, see .com is $0.99 first year, $13.99 renewal
2. Visit GoDaddy, see .com is $0.99 first year, $21.99 renewal
3. Open `pricing-config.json`
4. Update the values
5. Set `_lastUpdated` to today's date
6. Commit and push

## Automation (Optional)

You can set a monthly calendar reminder to check and update prices. It only takes 5 minutes!

## Testing Your Updates

After deploying:
1. Visit your domain checker page
2. Open browser console (F12)
3. Look for: `Live prices loaded: manually-verified`
4. Search for a domain
5. Verify prices match what you updated

## Need Help?

The pricing config file has helpful comments and validation URLs to check current prices.
