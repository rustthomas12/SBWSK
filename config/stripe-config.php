<?php
/**
 * Stripe Configuration Loader
 * Loads Stripe keys from .env file securely
 */

// Load environment variables from .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception('.env file not found. Copy .env.example to .env and add your keys.');
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parse KEY=value
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Don't override existing environment variables
            if (!isset($_ENV[$key])) {
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}

// Load .env file
$envPath = __DIR__ . '/../.env';
loadEnv($envPath);

// Get Stripe mode (test or live)
$stripeMode = $_ENV['STRIPE_MODE'] ?? 'test';

// Set appropriate keys based on mode
if ($stripeMode === 'live') {
    define('STRIPE_PUBLISHABLE_KEY', $_ENV['STRIPE_PUBLISHABLE_KEY_LIVE']);
    define('STRIPE_SECRET_KEY', $_ENV['STRIPE_SECRET_KEY_LIVE']);
    define('STRIPE_WEBHOOK_SECRET', $_ENV['STRIPE_WEBHOOK_SECRET_LIVE']);
} else {
    define('STRIPE_PUBLISHABLE_KEY', $_ENV['STRIPE_PUBLISHABLE_KEY_TEST']);
    define('STRIPE_SECRET_KEY', $_ENV['STRIPE_SECRET_KEY_TEST']);
    define('STRIPE_WEBHOOK_SECRET', $_ENV['STRIPE_WEBHOOK_SECRET_TEST']);
}

define('SITE_URL', $_ENV['SITE_URL']);
define('STRIPE_MODE', $stripeMode);

// Validate that keys are set
if (empty(STRIPE_PUBLISHABLE_KEY) || strpos(STRIPE_PUBLISHABLE_KEY, 'your_key_here') !== false) {
    throw new Exception('Stripe publishable key not configured. Please update your .env file.');
}

if (empty(STRIPE_SECRET_KEY) || strpos(STRIPE_SECRET_KEY, 'your_key_here') !== false) {
    throw new Exception('Stripe secret key not configured. Please update your .env file.');
}
