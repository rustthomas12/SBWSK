<?php
/**
 * Download Copy Kit Templates as ZIP
 * Verifies session and provides download
 */

// Load configuration
require_once __DIR__ . '/../config/stripe-config.php';

// Require Stripe library
require_once __DIR__ . '/../vendor/autoload.php';

// Set Stripe API key from config
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

try {
    $sessionId = $_GET['session'] ?? '';

    if (empty($sessionId)) {
        throw new Exception('No session ID provided');
    }

    // Verify the session
    $session = \Stripe\Checkout\Session::retrieve($sessionId);

    if ($session->payment_status !== 'paid') {
        throw new Exception('Payment not completed');
    }

    // Create ZIP file
    $zipFilename = 'copy-kit-templates.zip';
    $zipPath = sys_get_temp_dir() . '/' . $zipFilename;

    $zip = new ZipArchive();
    if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
        throw new Exception('Could not create ZIP file');
    }

    // Add all template files
    $templatesDir = __DIR__ . '/../copy-kit-templates/';
    $files = [
        '1-homepage-template.txt',
        '2-about-page-template.txt',
        '3-services-page-template.txt',
        '4-contact-page-template.txt',
        '5-seo-meta-tags-template.txt',
        'README.txt'
    ];

    foreach ($files as $file) {
        $filePath = $templatesDir . $file;
        if (file_exists($filePath)) {
            $zip->addFile($filePath, $file);
        }
    }

    $zip->close();

    // Log the download
    $logFile = __DIR__ . '/../logs/downloads.log';
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    $logEntry = date('Y-m-d H:i:s') . " - Download: Session $sessionId\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);

    // Send ZIP file to browser
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="' . $zipFilename . '"');
    header('Content-Length: ' . filesize($zipPath));
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');

    readfile($zipPath);

    // Clean up temp file
    unlink($zipPath);
    exit;

} catch (\Stripe\Exception\ApiErrorException $e) {
    http_response_code(400);
    die('Invalid session. Please check your email for the correct download link.');
} catch (Exception $e) {
    http_response_code(500);
    die('Error: ' . $e->getMessage());
}
