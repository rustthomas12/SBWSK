# Speed Check Score Discrepancy Debugging Guide

## Common Reasons Scores Don't Match

### 1. **Lab Data vs Field Data** (Most Common Issue)
Google PageSpeed Insights shows TWO different scores:
- **Lab Data** (Lighthouse) - Synthetic testing in a controlled environment
- **Field Data** (CrUX) - Real user data from Chrome User Experience Report

**Your API returns Lab Data (Lighthouse scores)**. Make sure you're comparing:
- Your Mobile Score → PageSpeed "Mobile" tab → "Performance" section → Lab Data score
- Your Desktop Score → PageSpeed "Desktop" tab → "Performance" section → Lab Data score

❌ **Don't compare to:**
- Field Data scores (shown at the top with "Real User Experience")
- Individual metric scores
- Opportunities/Diagnostics

### 2. **Natural Score Variability**
PageSpeed scores naturally vary between test runs:
- ±5-10 points is normal
- Website server performance varies
- Network conditions differ
- Third-party scripts load differently

### 3. **Cached Results**
- Google's API may return cached results (up to 30 seconds old)
- Test at different times for fresh results
- PageSpeed Insights website may use newer/uncached data

### 4. **Lighthouse Version Differences**
- Different versions can produce different scores
- Check logs to see which version the API is using
- PageSpeed Insights website might use a beta/newer version

## How to Debug

### Step 1: Check Vercel Logs
```bash
vercel logs --follow
```
Then run a speed test and look for the debug output showing:
- Lighthouse Version
- Raw Performance Score
- Form Factor (mobile/desktop)

### Step 2: Compare Side-by-Side
1. Test a website on your tool
2. Immediately test the SAME URL on https://pagespeed.web.dev/
3. Compare the **Lab Data** scores (not Field Data)
4. Check if you're on the correct tab (Mobile vs Desktop)

### Step 3: Verify API Response
Test the API directly:
```bash
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=YOUR_URL&category=performance&strategy=mobile&key=YOUR_KEY" | jq '.lighthouseResult.categories.performance.score'
```

## Expected Behavior
- Scores should match PageSpeed Insights **Lab Data** within ±5-10 points
- Mobile scores are typically 10-30 points lower than desktop
- Scores vary between test runs

## If Scores Are Wildly Different (>20 points)
This might indicate:
- Wrong API parameters
- Comparing Field Data instead of Lab Data
- Lighthouse version mismatch
- API key issues
