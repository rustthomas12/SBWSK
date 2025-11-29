<?php
/**
 * Get Stripe Publishable Key
 * Returns the publishable key for client-side use
 */

header('Content-Type: application/javascript');
header('Cache-Control: no-cache, must-revalidate');

// Load configuration
require_once __DIR__ . '/../config/stripe-config.php';

// Output JavaScript with the publishable key
echo "window.STRIPE_CONFIG = {\n";
echo "    publishableKey: '" . STRIPE_PUBLISHABLE_KEY . "',\n";
echo "    siteUrl: '" . SITE_URL . "',\n";
echo "    mode: '" . STRIPE_MODE . "'\n";
echo "};\n";
