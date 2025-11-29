# Server Setup Instructions for SBWSK

Your payment system is configured! Now you need to install PHP and Composer on your server.

## ✅ Already Configured:

- Stripe keys in `.env` file
- All payment files created
- Products configured
- Universal checkout system ready

## 🔧 Install Required Software:

### Option 1: Ubuntu/Debian Server

```bash
# Update package list
sudo apt update

# Install PHP and required extensions
sudo apt install -y php php-cli php-curl php-mbstring php-xml php-zip unzip

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Navigate to your project
cd /home/rustt/projects/New_Website/SBWSK

# Install Stripe library
composer require stripe/stripe-php

# Set proper permissions
chmod 600 .env
chmod 755 api/
chmod 755 config/
chmod 755 logs/
```

### Option 2: Shared Hosting (cPanel, etc.)

1. PHP is usually pre-installed
2. Upload your files via FTP
3. Use SSH to run: `composer require stripe/stripe-php`
4. Or manually download Stripe library from GitHub

### Option 3: Local Development (XAMPP/MAMP)

1. Install XAMPP or MAMP (includes PHP)
2. Copy project to htdocs folder
3. Open terminal in project directory
4. Run: `composer require stripe/stripe-php`

## 🧪 Test the Installation:

```bash
# Check PHP version (should be 7.4+)
php -v

# Check if Composer works
composer --version

# Install Stripe library
cd /home/rustt/projects/New_Website/SBWSK
composer require stripe/stripe-php
```

## 🌐 Configure Your Web Server:

### For Apache (.htaccess already configured):
```apache
# Already set up - no changes needed
```

### For Nginx (add to your config):
```nginx
location /api/ {
    try_files $uri $uri/ /api/index.php?$query_string;
}
```

## 🔗 Set Up Stripe Webhook:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://sbwsk.io/api/webhook.php`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Update `.env`:
   ```
   STRIPE_WEBHOOK_SECRET_TEST=whsec_your_secret_here
   ```

## 🚀 You're Ready!

Once PHP and Composer are installed:

1. ✅ Stripe keys configured
2. ✅ Products set up
3. ✅ Payment system ready
4. ✅ Just need to install PHP packages

Test at: https://sbwsk.io/website-copy-kit.html

Use test card: **4242 4242 4242 4242**

## 📱 Quick Install Command:

For Ubuntu/Debian servers, run this ONE command:

```bash
sudo apt update && sudo apt install -y php php-cli php-curl php-mbstring php-xml php-zip unzip curl && curl -sS https://getcomposer.org/installer | php && sudo mv composer.phar /usr/local/bin/composer && cd /home/rustt/projects/New_Website/SBWSK && composer require stripe/stripe-php && chmod 600 .env && echo "✅ Setup complete!"
```

## ❓ Need Help?

- PHP not found? Install it first
- Composer errors? Check PHP version (needs 7.4+)
- Permission denied? Use `sudo`
- Still stuck? Check SERVER_TROUBLESHOOTING.md

---

**Your keys are already configured! Just install PHP and you're live!**
