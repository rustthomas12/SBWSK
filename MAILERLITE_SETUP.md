# MailerLite Integration Guide

## Overview

Your site now integrates with **MailerLite** for professional email marketing and automated lead magnet delivery.

## Setup Complete

✅ **API Key Configured**: Your MailerLite API key is stored in Vercel environment variables
✅ **Popup Integration**: Email collector triggers after tool usage
✅ **Lead Magnet Focused**: Emphasizes free starter kit download

## How It Works

### 1. User Journey
1. User uses a tool (Domain Checker, Logo Generator, Quote Estimator)
2. Popup appears offering "Free Website Starter Kit"
3. User enters name and email
4. MailerLite API adds them to your email list
5. MailerLite automation sends welcome email with lead magnet

### 2. Popup Triggers
- **Domain Checker**: 3 seconds after search results
- **Logo Generator**: 2 seconds after download
- **Quote Estimator**: 5 seconds after viewing quote
- **Exit Intent**: Available (currently disabled)

## Required: MailerLite Setup

### Step 1: Create Automation in MailerLite

1. **Log in to MailerLite** → https://dashboard.mailerlite.com
2. Go to **Automations** → **Create Workflow**
3. **Select Trigger**: "Subscriber joins a group" OR "Subscriber added"
4. **Add Email Step**:

**Email Template:**
```
Subject: Your Free Website Starter Kit is Here! 🎁

Hi {$name}!

Thank you for downloading your Free Website Starter Kit!

Inside your starter kit, you'll find:

✅ Complete Website Launch Checklist
✅ Professional Copy Templates (Homepage, About, Services)
✅ Domain Selection Guide
✅ SEO Meta Tags Template
✅ Step-by-Step Launch Guide

[DOWNLOAD YOUR STARTER KIT] → Link to your files

Questions? Just reply to this email!

Best regards,
SBWSK Team

P.S. Check your spam folder if you don't see this email.
```

5. **Add Follow-up Sequence** (Optional but recommended):
   - Day 3: "How's your website coming along?"
   - Day 7: "Need help choosing a domain?" (link to domain checker)
   - Day 14: "Ready to launch? Here's your checklist"

### Step 2: Create Lead Magnet Files

Create a ZIP file or Google Drive folder with:

1. **website-launch-checklist.pdf** - Your launch checklist
2. **copy-templates.pdf** - Homepage, About, Services templates
3. **domain-guide.pdf** - How to choose a domain
4. **seo-meta-tags.pdf** - SEO templates
5. **README.txt** - Welcome and instructions

**Host Options:**
- Google Drive (set to "Anyone with link can view")
- Dropbox
- Your website's `/downloads` folder
- MailerLite file storage

### Step 3: Configure Group (Optional)

Create a specific group for website starter kit subscribers:

1. Go to **Subscribers** → **Groups**
2. Create group: "Website Starter Kit"
3. Copy the Group ID
4. Add to Vercel environment:
```bash
vercel env add MAILERLITE_GROUP_ID production
# Enter the group ID when prompted
```

This segments subscribers who got the free kit vs. other sources.

## API Endpoint Details

**POST `/api/mailerlite-subscribe`**

### Request:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "source": "Domain Checker"
}
```

### Response (Success):
```json
{
  "success": true,
  "message": "Success! Check your email for your free starter kit.",
  "data": {
    "email": "user@example.com",
    "subscriberId": "123456"
  }
}
```

### Response (Already Subscribed):
```json
{
  "success": true,
  "message": "You're already subscribed to our email list!",
  "alreadySubscribed": true
}
```

## Features

### Automatic Features:
- ✅ No double opt-in (instant access to lead magnet)
- ✅ Handles duplicate subscriptions gracefully
- ✅ Tracks source (which tool they used)
- ✅ Resubscribes if previously unsubscribed
- ✅ Mobile-responsive popup
- ✅ One popup per user (localStorage)
- ✅ Pinterest tracking (lead events)

### Lead Magnet Messaging:
- Emphasizes FREE starter kit
- Clear value proposition
- Immediate delivery promise
- Professional branding

## Best Practices

### Email Sequence Strategy:

**Email 1 (Immediate)**: Deliver the starter kit
- Subject: "Your Free Website Starter Kit is Here!"
- Include download link
- Set expectations for future emails

**Email 2 (Day 3)**: Check-in + value
- Subject: "Quick question about your website"
- Ask how they're doing with the kit
- Offer help or additional resources

**Email 3 (Day 7)**: Tool reminder
- Subject: "Have you tried our Domain Checker?"
- Link to specific tools
- Show social proof

**Email 4 (Day 14)**: Soft pitch
- Subject: "Ready to launch? We can help"
- Introduce paid services
- Include testimonials

**Email 5 (Day 21)**: Engagement
- Subject: "What's holding you back?"
- Survey or question
- Personalized recommendations

### Content Ideas:

**Weekly Newsletter**:
- Website tips and tricks
- Tool updates
- Success stories
- New templates

**Segmentation**:
- By source (Domain Checker vs Logo Generator)
- By engagement (opened emails vs didn't)
- By action (downloaded copy kit vs didn't)

## Customization

### Change Popup Message:

Edit `/js/email-collector.js`:
```javascript
const {
    title = 'Your Custom Title Here',
    message = 'Your custom message',
    leadMagnet = 'Your Lead Magnet Name'
} = options;
```

### Change Button Text:

The button automatically says: "Get My Free [Lead Magnet] →"

### Trigger Timing:

Adjust delays in tool files:
```javascript
emailCollector.triggerAfterToolUse('Domain Checker', 3000); // 3 seconds
```

## Testing

### Test Subscription:
1. Visit `/domain-checker.html`
2. Search for a domain
3. Wait for popup
4. Enter email and submit
5. Check MailerLite dashboard for new subscriber
6. Check email for welcome message

### Verify in MailerLite:
1. Go to **Subscribers**
2. Find your test email
3. Check **Custom Fields** for `source` value
4. Verify automation triggered

## Troubleshooting

### Popup Not Showing:
- Clear browser localStorage
- Check browser console for errors
- Ensure `/js/email-collector.js` is loaded

### API Error:
- Verify `MAILERLITE_API_KEY` in Vercel
- Check MailerLite API status
- Review Vercel function logs

### Email Not Received:
- Check spam folder
- Verify automation is active in MailerLite
- Test with different email provider

### Already Subscribed Message:
- This is normal for repeat subscribers
- They won't get duplicate emails
- Lead magnet link should be in original welcome email

## Analytics

### Track Performance in MailerLite:
- **Subscribers** → View growth over time
- **Automation** → Check delivery rates
- **Custom Fields** → Filter by source
- **Click Rate** → Track lead magnet downloads

### Track on Your Site:
- Pinterest events fire on subscription
- Check Pinterest Ads Manager for lead events
- Monitor which tools convert best

## Next Steps

1. ✅ **Create Your Lead Magnet** (starter kit PDF/ZIP)
2. ✅ **Set Up Automation** in MailerLite
3. ✅ **Add Download Link** to welcome email
4. ✅ **Plan Follow-Up Sequence** (5-7 emails)
5. ⬜ **Test Full Flow** (signup → email → download)
6. ⬜ **Monitor Results** (open rates, clicks)
7. ⬜ **Optimize** (A/B test subject lines, timing)

## Support

- **MailerLite Help**: https://www.mailerlite.com/help
- **API Docs**: https://developers.mailerlite.com/
- **Your Dashboard**: https://dashboard.mailerlite.com

## Environment Variables

```bash
MAILERLITE_API_KEY=your_api_key_here  # ✅ Already set
MAILERLITE_GROUP_ID=group_id_here     # ⬜ Optional
```

To add group ID:
```bash
vercel env add MAILERLITE_GROUP_ID production
```

---

**Your MailerLite integration is ready!** Just create your lead magnet and automation, and you'll start building your email list automatically. 🚀
