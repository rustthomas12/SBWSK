<?php
/**
 * Verify Stripe Checkout Session
 * Returns whether a session is valid for downloading
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Load configuration
require_once __DIR__ . '/../config/stripe-config.php';

// Require Stripe library
require_once __DIR__ . '/../vendor/autoload.php';

// Set Stripe API key from config
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

try {
    $sessionId = $_GET['session_id'] ?? '';

    if (empty($sessionId)) {
        throw new Exception('No session ID provided');
    }

    // Retrieve the session from Stripe
    $session = \Stripe\Checkout\Session::retrieve($sessionId);

    // Check if payment was successful
    $valid = ($session->payment_status === 'paid');

    echo json_encode([
        'valid' => $valid,
        'session_id' => $sessionId,
        'customer_email' => $session->customer_details->email ?? $session->customer_email ?? null,
    ]);

} catch (\Stripe\Exception\ApiErrorException $e) {
    http_response_code(400);
    echo json_encode([
        'valid' => false,
        'error' => 'Invalid session'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'valid' => false,
        'error' => $e->getMessage()
    ]);
}
