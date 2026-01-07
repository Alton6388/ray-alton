#!/bin/bash
# Interactive Two-Wallet Setup for XRPL Marketplace

clear
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║      🔄 TWO-WALLET FUND TRANSFER TEST SETUP                 ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "This script helps you set up two separate wallets to verify"
echo "real fund transfers in your XRPL marketplace."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if addresses are provided as arguments
if [ ! -z "$1" ] && [ ! -z "$2" ]; then
  BUYER_ADDRESS=$1
  SELLER_ADDRESS=$2
else
  # Interactive mode
  echo "📋 STEP 1: Create Two Wallets"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Choose your method:"
  echo ""
  echo "  [A] Two Crossmark Profiles (Easiest - Recommended)"
  echo "      → Best for testing with browser extension"
  echo "      → Can switch between buyer/seller easily"
  echo ""
  echo "  [B] XRPL Faucet (Two separate wallets)"
  echo "      → Creates standalone test wallets"
  echo "      → Import one to Crossmark later"
  echo ""
  read -p "Enter choice [A/B]: " METHOD
  echo ""

  if [ "$METHOD" == "A" ] || [ "$METHOD" == "a" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎯 METHOD A: Two Crossmark Profiles"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Step 1: Open Crossmark Extension"
    echo "  → Click profile icon (top right)"
    echo "  → Click 'Add Account' or 'Create New Wallet'"
    echo "  → Create a SECOND wallet profile"
    echo ""
    echo "Step 2: Fund Both Wallets"
    echo "  → Switch to each profile"
    echo "  → Go to: https://xrpl.org/xrp-testnet-faucet.html"
    echo "  → Get testnet XRP for each"
    echo ""
    echo "Step 3: Enter Addresses Below"
    echo ""
    
  elif [ "$METHOD" == "B" ] || [ "$METHOD" == "b" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎯 METHOD B: XRPL Faucet"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Opening XRPL Testnet Faucet in browser..."
    echo ""
    open "https://xrpl.org/xrp-testnet-faucet.html"
    sleep 2
    echo ""
    echo "Instructions:"
    echo "  1. Click 'Generate Faucet Credentials' (1st time - BUYER)"
    echo "  2. Save the address and secret"
    echo "  3. Click 'Generate' again (2nd time - SELLER)"
    echo "  4. Save the second address and secret"
    echo "  5. Enter both addresses below"
    echo ""
  else
    echo "❌ Invalid choice. Exiting."
    exit 1
  fi

  # Get buyer address
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "💰 WALLET 1: BUYER (Your main wallet)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  read -p "Enter BUYER wallet address (starts with 'r'): " BUYER_ADDRESS
  echo ""

  # Validate buyer address
  if [[ ! $BUYER_ADDRESS =~ ^r[a-zA-Z0-9]{24,34}$ ]]; then
    echo "❌ Error: Invalid XRPL address format for buyer"
    echo "   Address should start with 'r' and be 25-35 characters"
    exit 1
  fi

  # Get seller address
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🏪 WALLET 2: SELLER (Receives payments)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  read -p "Enter SELLER wallet address (starts with 'r'): " SELLER_ADDRESS
  echo ""

  # Validate seller address
  if [[ ! $SELLER_ADDRESS =~ ^r[a-zA-Z0-9]{24,34}$ ]]; then
    echo "❌ Error: Invalid XRPL address format for seller"
    echo "   Address should start with 'r' and be 25-35 characters"
    exit 1
  fi

  # Check they're different
  if [ "$BUYER_ADDRESS" == "$SELLER_ADDRESS" ]; then
    echo "⚠️  Warning: Buyer and seller addresses are the same"
    echo "   This will create a self-escrow (funds to yourself)"
    echo ""
    read -p "Continue anyway? [y/N]: " CONFIRM
    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
      echo "Cancelled."
      exit 1
    fi
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Wallet Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Buyer Address:  $BUYER_ADDRESS"
echo "Seller Address: $SELLER_ADDRESS"
echo ""

# Save to .env.local
echo "BUYER_WALLET=$BUYER_ADDRESS" > .env.local
echo "SELLER_WALLET=$SELLER_ADDRESS" >> .env.local
echo ""
echo "✅ Saved wallet addresses to .env.local"
echo ""

# Update mockProducts.ts
echo "📝 Updating product seller addresses..."
node update-seller.js $SELLER_ADDRESS

if [ $? -eq 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 SETUP COMPLETE!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📊 Your Test Configuration:"
  echo ""
  echo "  BUYER (You):        $BUYER_ADDRESS"
  echo "  └─ Use this wallet to connect & purchase"
  echo ""
  echo "  SELLER (Merchant):  $SELLER_ADDRESS"
  echo "  └─ Receives escrow payments"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🧪 Test Fund Transfer Flow:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "1️⃣ Check Buyer Balance (Before):"
  echo "   https://testnet.xrpl.org/accounts/$BUYER_ADDRESS"
  echo ""
  echo "2️⃣ Check Seller Balance (Before):"
  echo "   https://testnet.xrpl.org/accounts/$SELLER_ADDRESS"
  echo ""
  echo "3️⃣ Start Marketplace:"
  echo "   npm run dev"
  echo ""
  echo "4️⃣ Connect & Purchase:"
  echo "   → Open: http://localhost:3001"
  echo "   → Connect Crossmark with BUYER wallet"
  echo "   → Buy: 'Market Analysis Report' (3.99 XRP)"
  echo "   → Approve transaction"
  echo ""
  echo "5️⃣ Verify Escrow Created:"
  echo "   → Copy transaction hash"
  echo "   → Check: https://testnet.xrpl.org/transactions/HASH"
  echo "   → Verify: Destination = Seller address"
  echo ""
  echo "6️⃣ Check Balances (After):"
  echo "   → Buyer: Balance decreased by ~4 XRP"
  echo "   → Seller: Shows pending escrow (Objects tab)"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📚 Documentation:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Full Guide:     cat TWO_WALLET_TESTING.md"
  echo "  Quick Start:    cat QUICKSTART.md"
  echo "  Setup Guide:    cat SETUP_GUIDE.md"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Ready to test? Run: npm run dev 🚀"
  echo ""
else
  echo ""
  echo "❌ Error updating seller addresses. Please check above for details."
  exit 1
fi
