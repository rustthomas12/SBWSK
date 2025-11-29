<?php
/**
 * Stripe Webhook Handler
 * This handles Stripe events like successful payments
 * Set this URL in your Stripe Dashboard: https://dashboard.stripe.com/webhooks
 */

// Load configuration
require_once __DIR__ . '/../config/stripe-config.php';

// Require Stripe PHP library
require_once __DIR__ . '/../vendor/autoload.php';

// Set Stripe API key from config
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

// Get webhook signing secret from config
$endpoint_secret = STRIPE_WEBHOOK_SECRET;

$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
$event = null;

try {
    $event = \Stripe\Webhook::constructEvent(
        $payload, $sig_header, $endpoint_secret
    );
} catch(\UnexpectedValueException $e) {
    // Invalid payload
    http_response_code(400);
    exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    // Invalid signature
    http_response_code(400);
    exit();
}

// Handle the event
switch ($event->type) {
    case 'checkout.session.completed':
        $session = $event->data->object;

        // Get customer email
        $customerEmail = $session->customer_details->email ?? $session->customer_email;
        $sessionId = $session->id;
        $product = $session->metadata->product ?? 'unknown';

        // Log the purchase (you could save to database)
        $logFile = __DIR__ . '/../logs/purchases.log';
        $logDir = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $logEntry = date('Y-m-d H:i:s') . " - Purchase: $product, Email: $customerEmail, Session: $sessionId\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND);

        // Send email with download link
        sendDownloadEmail($customerEmail, $sessionId);

        break;

    case 'payment_intent.succeeded':
        // Payment succeeded
        break;

    case 'payment_intent.payment_failed':
        // Payment failed
        break;

    default:
        // Unexpected event type
        error_log('Received unknown event type: ' . $event->type);
}

http_response_code(200);

/**
 * Send email with download link
 */
function sendDownloadEmail($email, $sessionId) {
    $to = $email;
    $subject = 'Your 10-Minute Website Copy Kit is Ready!';

    // Create download URL
    $downloadUrl = 'https://yoursite.com/copy-kit-success.html?session_id=' . $sessionId;

    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎉 Thank You for Your Purchase!</h1>
            </div>
            <div class='content'>
                <h2>Your Copy Kit is Ready to Download</h2>
                <p>Thanks for purchasing The 10-Minute Website Copy Kit! You now have everything you need to create professional website copy in minutes.</p>

                <p><strong>What's Included:</strong></p>
                <ul>
                    <li>✓ Homepage fill-in-the-blank template</li>
                    <li>✓ About page template</li>
                    <li>✓ Services page template</li>
                    <li>✓ Contact page template</li>
                    <li>✓ SEO meta tag templates</li>
                </ul>

                <p style='text-align: center;'>
                    <a href='$downloadUrl' class='button'>Download Your Templates Now →</a>
                </p>

                <p><strong>Getting Started:</strong></p>
                <ol>
                    <li>Click the button above to access your download page</li>
                    <li>Download all 5 template files</li>
                    <li>Open each template and fill in the blanks</li>
                    <li>Copy and paste to your website</li>
                </ol>

                <p><strong>Need Help?</strong></p>
                <p>If you have any questions or issues, just reply to this email. We're here to help!</p>

                <p>Here's to your success! 🚀</p>
                <p>- The SBWSK Team</p>
            </div>
            <div class='footer'>
                <p>&copy; 2025 Small Business Website Starter Kit</p>
                <p>You're receiving this email because you purchased our product.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=utf-8',
        'From: SBWSK <noreply@sbwsk.com>',
        'Reply-To: support@sbwsk.com',
    ];

    mail($to, $subject, $message, implode("\r\n", $headers));
}
