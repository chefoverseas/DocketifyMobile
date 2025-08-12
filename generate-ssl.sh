#!/bin/bash

# Generate SSL certificates for HTTPS development
echo "🔐 Generating SSL certificates for HTTPS..."

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate self-signed certificate valid for 365 days
openssl req -x509 \
    -newkey rsa:4096 \
    -keyout certs/key.pem \
    -out certs/cert.pem \
    -days 365 \
    -nodes \
    -subj "/C=US/ST=CA/L=San Francisco/O=Docketify/OU=IT Department/CN=localhost"

echo "✅ SSL certificates generated successfully!"
echo "🔐 Key file: certs/key.pem"
echo "🔐 Certificate file: certs/cert.pem"
echo ""
echo "🚀 You can now run the server with HTTPS enabled"
echo "📱 Access your secure app at: https://localhost:5000"
echo ""
echo "⚠️  Note: Your browser will show a security warning for self-signed certificates"
echo "   Click 'Advanced' and 'Proceed to localhost (unsafe)' to continue"