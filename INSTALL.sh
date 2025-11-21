#!/bin/bash

# INDRA Mobile - Automated Installation Script
# This script sets up the complete development environment

set -e

echo "🚀 INDRA Mobile - Installation Script"
echo "======================================"
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Install Expo CLI globally if not present
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g expo-cli
    echo "✅ Expo CLI installed"
else
    echo "✅ Expo CLI already installed"
fi
echo ""

# Install EAS CLI globally if not present
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI globally..."
    npm install -g eas-cli
    echo "✅ EAS CLI installed"
else
    echo "✅ EAS CLI already installed"
fi
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    
    # Try to detect IP address
    if command -v ipconfig &> /dev/null; then
        # Windows
        IP=$(ipconfig | grep -oP '(?<=IPv4 Address.*: )[\d.]+' | head -1)
    elif command -v ifconfig &> /dev/null; then
        # Mac/Linux
        IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    else
        IP="192.168.1.100"
    fi
    
    # Update .env with detected IP
    sed -i.bak "s/192.168.1.100/$IP/g" .env && rm .env.bak
    
    echo "✅ .env file created with IP: $IP"
    echo "⚠️  Please verify the IP address in .env matches your computer's IP"
else
    echo "✅ .env file already exists"
fi
echo ""

# Create assets directory if it doesn't exist
if [ ! -d assets ]; then
    echo "📁 Creating assets directory..."
    mkdir -p assets
    echo "✅ Assets directory created"
fi
echo ""

echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Start the mock backend server:"
echo "   node server.js"
echo ""
echo "2. In a new terminal, start the Expo development server:"
echo "   npm start"
echo ""
echo "3. Scan the QR code with Expo Go app on your phone"
echo ""
echo "For detailed setup instructions, see SETUP.md"
echo ""
echo "Demo credentials:"
echo "  Email: worker@indra.com"
echo "  Password: password123"
echo ""
