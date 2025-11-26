# Domain Price Update Scripts

## Automatic Price Updates

This directory contains scripts that automatically update domain registration prices in the domain checker tool.

### How It Works

1. **Script**: `update-domain-prices.js` fetches current prices from domain providers
2. **GitHub Action**: Runs automatically every Monday at 9:00 AM UTC
3. **Updates**: Automatically commits and pushes changes if prices have changed

### Providers Monitored

- **Bluehost** - Free with hosting plans
- **Hostinger** - Low first-year pricing
- **GoDaddy** - Popular choice
- **SiteGround** - Consistent pricing

### Manual Update

To manually update prices, run:

```bash
node scripts/update-domain-prices.js
```

Or trigger the GitHub Action manually from the "Actions" tab in GitHub.

### Customization

To add more providers or modify price fetching logic:

1. Edit `update-domain-prices.js`
2. Add a new fetch function in the `priceUpdaters` object
3. Add the provider to the `newPricing` object
4. Update the GitHub Action workflow if needed

### Price Accuracy

The script ensures prices are verified weekly, so customers always see current rates and won't be upset about inaccurate estimates.
