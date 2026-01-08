#!/bin/bash
# Complete setup script for two-wallet testing

echo "🔧 XRPL Marketplace - Two-Wallet Setup"
echo "======================================"
echo ""
echo "This script will help you set up a buyer-seller test environment"
echo ""

# Check if seller address is provided
if [ -z "$1" ]; then
  echo "📋 Step 1: Create a Seller Test Wallet"
  echo "--------------------------------------"
  echo ""
  echo "Choose one method:"
  echo ""
  echo "  Method 1 (Easiest): XRPL Testnet Faucet"
  echo "  → Visit: https://xrpl.org/xrp-testnet-faucet.html"
  echo "  → Click 'Generate Faucet Credentials'"
  echo "  → Copy the ADDRESS (starts with 'r')"
  echo "  → Save the SECRET safely (for testing only)"
  echo ""
  echo "  Method 2: Crossmark Second Profile"
  echo "  → Open Crossmark → Settings → Add Account"
  echo "  → Create new wallet"
  echo "  → Fund at: https://xrpl.org/xrp-testnet-faucet.html"
  echo ""
  echo "📋 Step 2: Run This Script Again"
  echo "--------------------------------------"
  echo ""
  echo "Usage: ./setup-wallets.sh rYourSellerAddressHere"
  echo ""
  echo "Example:"
  echo "  ./setup-wallets.sh rN7n7otQDd6FczFgLdllcK85EQ4jgvnM"
  echo ""
  exit 0
fi

SELLER_ADDRESS=$1

echo "🔍 Validating seller address..."
echo "   Address: $SELLER_ADDRESS"
echo ""

# Basic validation
if [[ ! $SELLER_ADDRESS =~ ^r[a-zA-Z0-9]{24,34}$ ]]; then
  echo "❌ Error: Invalid XRPL address format"
  echo "   Address should start with 'r' and be 25-35 characters"
  echo ""
  exit 1
fi

echo "✅ Address format looks good!"
echo ""

# Update mockProducts.ts using node script
echo "📝 Updating product seller addresses..."
node update-seller.js $SELLER_ADDRESS

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Setup Complete!"
  echo "=================="
  echo ""
  echo "📌 Your Configuration:"
  echo "   Buyer Wallet:  Your Crossmark wallet (connect in app)"
  echo "   Seller Wallet: $SELLER_ADDRESS"
  echo ""
  echo "🧪 Testing Flow:"
  echo "   1. Buyer connects wallet → Creates escrow"
  echo "   2. Escrow sent to → $SELLER_ADDRESS"
  echo "   3. Seller can finish escrow → Receives payment"
  echo ""
  echo "🚀 Next Steps:"
  echo "   1. Start dev server:  npm run dev"
  echo "   2. Open:              http://localhost:3001"
  echo "   3. Connect wallet:    Your Crossmark (buyer)"
  echo "   4. Buy a product:     Creates escrow to seller"
  echo "   5. Check Explorer:    https://testnet.xrpl.org"
  echo ""
  echo "📚 Documentation:"
  echo "   - WALLET_SETUP.md     → Wallet creation guide"
  echo "   - SETUP_GUIDE.md      → Full marketplace guide"
  echo ""
else
  echo ""
  echo "❌ Update failed. Please check error messages above."
  echo ""
  exit 1
fi
