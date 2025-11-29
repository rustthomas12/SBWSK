#!/bin/bash

echo "=========================================="
echo "  SBWSK Copy Kit - Stripe Setup"
echo "=========================================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✓ .env file already exists"
    read -p "Do you want to reconfigure? (y/n): " reconfigure
    if [ "$reconfigure" != "y" ]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Copy .env.example to .env
cp .env.example .env
echo "✓ Created .env file"
echo ""

# Get Stripe keys
echo "📋 Please provide your Stripe information:"
echo "(Get these from: https://dashboard.stripe.com/apikeys)"
echo ""

read -p "Stripe Publishable Key (TEST): " pk_test
read -p "Stripe Secret Key (TEST): " sk_test
read -p "Your Website URL (e.g., https://sbwsk.com): " site_url

# Update .env file
sed -i "s|STRIPE_PUBLISHABLE_KEY_TEST=.*|STRIPE_PUBLISHABLE_KEY_TEST=$pk_test|" .env
sed -i "s|STRIPE_SECRET_KEY_TEST=.*|STRIPE_SECRET_KEY_TEST=$sk_test|" .env
sed -i "s|SITE_URL=.*|SITE_URL=$site_url|" .env

echo ""
echo "✓ Configuration saved to .env"
echo ""

# Install Composer dependencies
echo "📦 Installing Stripe PHP library..."
if command -v composer &> /dev/null; then
    composer require stripe/stripe-php
    echo "✓ Stripe library installed"
else
    echo "⚠ Composer not found. Please install manually:"
    echo "   composer require stripe/stripe-php"
fi

echo ""

# Create logs directory
mkdir -p logs
chmod 755 logs
echo "✓ Created logs directory"

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Set up webhook in Stripe Dashboard:"
echo "   URL: $site_url/api/webhook.php"
echo "   Event: checkout.session.completed"
echo ""
echo "2. Copy the webhook signing secret and run:"
echo "   nano .env"
echo "   (Update STRIPE_WEBHOOK_SECRET_TEST)"
echo ""
echo "3. Test the integration:"
echo "   Visit: $site_url/website-copy-kit.html"
echo "   Use test card: 4242 4242 4242 4242"
echo ""
echo "4. When ready to go live:"
echo "   - Get live keys from Stripe"
echo "   - Update .env with live keys"
echo "   - Change STRIPE_MODE=live"
echo ""
echo "=========================================="
