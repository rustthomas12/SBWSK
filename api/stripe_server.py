#!/usr/bin/env python3
"""
Stripe Payment Server (Python Alternative)
Run this if PHP isn't available
"""

import os
import json
import hmac
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import subprocess

# Load .env file
def load_env():
    env_vars = {}
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

env = load_env()

# Install Stripe if needed
try:
    import stripe
except ImportError:
    print("Installing Stripe library...")
    subprocess.check_call(['pip3', 'install', 'stripe'])
    import stripe

# Configure Stripe
stripe_mode = env.get('STRIPE_MODE', 'test')
if stripe_mode == 'live':
    stripe.api_key = env.get('STRIPE_SECRET_KEY_LIVE')
else:
    stripe.api_key = env.get('STRIPE_SECRET_KEY_TEST')

site_url = env.get('SITE_URL', 'http://localhost:8000')

# Load products
def load_products():
    # Since we can't run PHP, use JSON config
    return {
        'copy-kit': {
            'name': 'The 10-Minute Website Copy Kit',
            'price': 1700,
            'currency': 'usd',
            'description': 'Professional website copy templates',
        },
        'premium-logo': {
            'name': 'Premium Logo Design Service',
            'price': 9900,
            'currency': 'usd',
            'description': 'Professional custom logo design',
        },
        'template-startup': {
            'name': 'Startup Pro Website Template',
            'price': 4900,
            'currency': 'usd',
            'description': 'Modern startup website template',
        },
        'template-portfolio': {
            'name': 'Creative Portfolio Template',
            'price': 3900,
            'currency': 'usd',
            'description': 'Stunning portfolio template',
        },
        'template-ecommerce': {
            'name': 'E-Commerce Store Template',
            'price': 9900,
            'currency': 'usd',
            'description': 'Full-featured online store',
        },
    }

class StripeHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == '/api/get-stripe-key.php':
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.end_headers()

            key = env.get('STRIPE_PUBLISHABLE_KEY_TEST')
            js = f'''window.STRIPE_CONFIG = {{
    publishableKey: '{key}',
    siteUrl: '{site_url}',
    mode: '{stripe_mode}'
}};'''
            self.wfile.write(js.encode())
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path == '/api/create-checkout-session.php':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body)

            products = load_products()
            product_id = data.get('product')

            if product_id in products:
                product = products[product_id]

                try:
                    session = stripe.checkout.Session.create(
                        payment_method_types=['card'],
                        line_items=[{
                            'price_data': {
                                'currency': product['currency'],
                                'product_data': {
                                    'name': product['name'],
                                    'description': product['description'],
                                },
                                'unit_amount': product['price'],
                            },
                            'quantity': 1,
                        }],
                        mode='payment',
                        success_url=data.get('successUrl', f'{site_url}/copy-kit-success.html?session_id={{CHECKOUT_SESSION_ID}}'),
                        cancel_url=data.get('cancelUrl', site_url),
                    )

                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'id': session.id}).encode())
                except Exception as e:
                    self.send_error(500, str(e))
            else:
                self.send_error(400, 'Product not found')
        else:
            self.send_error(404)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    server = HTTPServer(('0.0.0.0', port), StripeHandler)
    print(f'✅ Stripe server running on port {port}')
    print(f'✅ Using {stripe_mode} mode')
    print(f'✅ Ready to accept payments!')
    server.serve_forever()
