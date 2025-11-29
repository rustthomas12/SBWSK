<?php
/**
 * Products Configuration
 * Central place to manage all products and their pricing
 */

return [
    'copy-kit' => [
        'name' => 'The 10-Minute Website Copy Kit',
        'price' => 1700, // $17.00 in cents
        'currency' => 'usd',
        'description' => 'Professional website copy templates - Homepage, About, Services, Contact, and SEO Meta Tags',
        'images' => [],
        'download_files' => [
            'copy-kit-templates/1-homepage-template.txt',
            'copy-kit-templates/2-about-page-template.txt',
            'copy-kit-templates/3-services-page-template.txt',
            'copy-kit-templates/4-contact-page-template.txt',
            'copy-kit-templates/5-seo-meta-tags-template.txt',
            'copy-kit-templates/README.txt',
        ],
        'success_url' => '/copy-kit-success.html',
    ],

    'premium-logo' => [
        'name' => 'Premium Logo Design Service',
        'price' => 1000, // $10.00 in cents
        'currency' => 'usd',
        'description' => 'Professional custom logo design with unlimited revisions and full commercial rights',
        'images' => [],
        'download_files' => [],
        'success_url' => '/premium-logo-success.html',
    ],

    'template-startup' => [
        'name' => 'Startup Pro Website Template',
        'price' => 4900, // $49.00
        'currency' => 'usd',
        'description' => 'Modern startup website template with hero sections, testimonials, and CTAs',
        'images' => [],
        'download_files' => [],
        'success_url' => '/template-success.html',
    ],

    'template-portfolio' => [
        'name' => 'Creative Portfolio Template',
        'price' => 3900, // $39.00
        'currency' => 'usd',
        'description' => 'Stunning portfolio template perfect for designers and photographers',
        'images' => [],
        'download_files' => [],
        'success_url' => '/template-success.html',
    ],

    'template-ecommerce' => [
        'name' => 'E-Commerce Store Template',
        'price' => 9900, // $99.00
        'currency' => 'usd',
        'description' => 'Full-featured online store with shopping cart and payment integration',
        'images' => [],
        'download_files' => [],
        'success_url' => '/template-success.html',
    ],

    'template-restaurant' => [
        'name' => 'Restaurant & Cafe Template',
        'price' => 8900, // $89.00
        'currency' => 'usd',
        'description' => 'Beautiful restaurant template with menu displays and reservation system',
        'images' => [],
        'download_files' => [],
        'success_url' => '/template-success.html',
    ],

    'website-package-basic' => [
        'name' => 'Basic Website Package',
        'price' => 49900, // $499.00
        'currency' => 'usd',
        'description' => 'Complete basic website setup with 5 pages, hosting included',
        'images' => [],
        'download_files' => [],
        'success_url' => '/package-success.html',
    ],

    'website-package-pro' => [
        'name' => 'Professional Website Package',
        'price' => 99900, // $999.00
        'currency' => 'usd',
        'description' => 'Full professional website with custom design, 10 pages, SEO optimization',
        'images' => [],
        'download_files' => [],
        'success_url' => '/package-success.html',
    ],

    'website-package-ecommerce' => [
        'name' => 'E-Commerce Website Package',
        'price' => 199900, // $1,999.00
        'currency' => 'usd',
        'description' => 'Complete online store setup with payment processing and inventory management',
        'images' => [],
        'download_files' => [],
        'success_url' => '/package-success.html',
    ],
];
