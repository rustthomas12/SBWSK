<?php
/**
 * Stripe Checkout Session Creator
 * This script creates a Stripe checkout session for the Website Copy Kit
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set headers
header('Content-Type: application/json');

// Allow CORS (adjust for production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load configuration
require_once __DIR__ . '/../config/stripe-config.php';

// Require Stripe PHP library
require_once __DIR__ . '/../vendor/autoload.php';

// Set Stripe API key from config
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

try {
    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        throw new Exception('Invalid request data');
    }

    // Load products configuration
    $products = require __DIR__ . '/../config/products.php';

    // Get product ID
    $productId = $data['product'] ?? null;
    if (!$productId) {
        throw new Exception('Product ID required');
    }

    // Check if product exists in config
    if (isset($products[$productId])) {
        $product = $products[$productId];
        $productName = $product['name'];
        $price = $data['customPrice'] ?? $product['price'];
        $currency = $product['currency'];
        $description = $product['description'];
        $successUrl = $data['successUrl'] ?? (SITE_URL . $product['success_url'] . '?session_id={CHECKOUT_SESSION_ID}');
    } else {
        // Fallback for custom products
        $requiredFields = ['productName', 'price', 'currency', 'successUrl', 'cancelUrl'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }
        $productName = $data['productName'];
        $price = $data['price'];
        $currency = $data['currency'];
        $description = $data['description'] ?? '';
        $successUrl = $data['successUrl'];
    }

    $cancelUrl = $data['cancelUrl'] ?? SITE_URL;

    // Create Stripe Checkout Session
    $session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price_data' => [
                'currency' => $currency,
                'product_data' => [
                    'name' => $productName,
                    'description' => $description,
                    'images' => isset($data['images']) ? $data['images'] : [],
                ],
                'unit_amount' => $price,
            ],
            'quantity' => 1,
        ]],
        'mode' => 'payment',
        'success_url' => $successUrl,
        'cancel_url' => $cancelUrl,
        'metadata' => [
            'product' => $productId,
        ],
        // Optional: collect customer email
        'customer_email' => isset($data['email']) ? $data['email'] : null,
        // Optional: allow promotion codes
        'allow_promotion_codes' => true,
    ]);

    // Return session ID
    echo json_encode([
        'id' => $session->id,
        'url' => $session->url
    ]);

} catch (\Stripe\Exception\ApiErrorException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Stripe error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
