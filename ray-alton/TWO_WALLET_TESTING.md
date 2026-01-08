# 🔄 Two-Wallet Testing Guide

## Complete Fund Transfer Verification

This guide shows you how to create TWO wallets and verify real fund transfers between them.

---

## 🎯 Strategy Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL FUND TRANSFER TEST                       │
└─────────────────────────────────────────────────────────────────┘

WALLET 1 (BUYER)              ESCROW              WALLET 2 (SELLER)
┌──────────────┐                                  ┌──────────────┐
│ Crossmark A  │                                  │ Crossmark B  │
│ rABC123...   │                                  │ rXYZ789...   │
│ Balance: 100 │                                  │ Balance: 0   │
└──────┬───────┘                                  └──────┬───────┘
       │                                                 │
       │ 1. Connect & Buy Product                       │
       │    Amount: 5.99 XRP                            │
       ├────────────────────────────────────────────────>│
       │    EscrowCreate Transaction                    │
       │    Destination: Wallet 2                       │
       │                                                 │
       │ 2. Funds Locked in Escrow ✅                   │
       │    Buyer Balance: 94.01 XRP (minus fees)       │
       │    Seller Balance: 0 XRP (escrow pending)      │
       │                                                 │
       │ 3. View Escrow on Explorer                     │
       │    Status: Pending                             │
       │    Amount: 5.99 XRP                            │
       │    Release After: 7 days                       │
       │                                                 │
       │ 4. Finish Escrow (Complete Transaction)        │
       │<────────────────────────────────────────────────│
       │    EscrowFinish Transaction                    │
       │    Triggered by: Buyer or Seller              │
       │                                                 │
       │ 5. Funds Released ✅                           │
       │    Buyer Balance: 94.01 XRP                    │
       │    Seller Balance: 5.99 XRP                    │
       └─────────────────────────────────────────────────┘
```

---

## 📋 Method 1: Two Crossmark Profiles (Easiest)

### Step 1: Create Buyer Wallet (Your Main Wallet)

**If you already have Crossmark:**
- ✅ Your current wallet = Buyer wallet
- ✅ Skip to Step 2

**If you DON'T have Crossmark yet:**
1. Install Crossmark: https://crossmark.io
2. Create wallet
3. Switch to Testnet (Settings → Network → Testnet)
4. Fund it: https://xrpl.org/xrp-testnet-faucet.html
5. Copy your address (e.g., `rABC123...`)

---

### Step 2: Create Seller Wallet (Second Profile)

**In Crossmark Extension:**

1. **Open Crossmark** → Click your profile icon (top right)
2. **Click "Add Account"** or **"Create New Wallet"**
3. **Choose "Create New Wallet"**
4. **Save the seed phrase** (write it down - testing only!)
5. **Name it:** "Seller Test Wallet"
6. **Switch to Testnet:**
   - Settings → Network → Testnet
7. **Copy the address** (starts with `r`)
8. **Fund the wallet:**
   - Go to: https://xrpl.org/xrp-testnet-faucet.html
   - Paste your seller address
   - Click "Generate"
   - Wait for 1000 XRP

---

### Step 3: Document Your Wallets

```bash
# Save this for reference
echo "BUYER_WALLET=rYourBuyerAddress" >> .env.local
echo "SELLER_WALLET=rYourSellerAddress" >> .env.local

# Example:
# BUYER_WALLET=rABC123def456GHI789jkl012MNO345
# SELLER_WALLET=rXYZ987wvu654TSR321qpo098LKJ876
```

---

### Step 4: Update Marketplace with Seller Address

```bash
# Run the setup script with your SELLER address
./setup-wallets.sh rYourSellerAddressHere

# Or use the quick updater
node update-seller.js rYourSellerAddressHere
```

---

### Step 5: Test Fund Transfer

**A. Make Purchase (as Buyer)**

1. **Switch to Buyer profile** in Crossmark
2. **Start marketplace:**
   ```bash
   npm run dev
   ```
3. **Open:** http://localhost:3001
4. **Connect wallet** (should connect Buyer wallet)
5. **Buy cheapest product:** "Market Analysis Report" (3.99 XRP)
6. **Approve transaction** in Crossmark
7. **Copy transaction hash**

**B. Verify Escrow Created**

1. **Open XRPL Explorer:**
   ```
   https://testnet.xrpl.org/transactions/YOUR_TX_HASH
   ```
2. **Check transaction details:**
   - ✅ Type: EscrowCreate
   - ✅ Status: tesSUCCESS
   - ✅ Account: Your buyer address
   - ✅ Destination: Your seller address
   - ✅ Amount: 3.99 XRP (or product price)

**C. Check Wallet Balances**

1. **Buyer wallet:**
   ```
   https://testnet.xrpl.org/accounts/rYourBuyerAddress
   ```
   - Should see: Balance decreased by ~4 XRP (price + fees)
   - Should see: EscrowCreate transaction

2. **Seller wallet:**
   ```
   https://testnet.xrpl.org/accounts/rYourSellerAddress
   ```
   - Should see: Pending escrow (Objects tab)
   - Balance: 0 XRP (funds still in escrow)

**D. Finish Escrow (Release Funds)**

Switch to Seller profile in Crossmark:

1. **Find escrow details** on explorer
2. **Get Escrow Sequence Number** from transaction
3. **Run escrow finish:**
   ```javascript
   // In browser console or your code
   // This releases the funds to seller
   ```

**E. Verify Funds Transferred**

Check seller wallet balance:
```
https://testnet.xrpl.org/accounts/rYourSellerAddress
```
- ✅ Balance should now show: 3.99 XRP (or product price)
- ✅ Seller received the payment!

---

## 📋 Method 2: Use XRPL Faucet for Both Wallets

### Step 1: Create Buyer Wallet

1. **Go to:** https://xrpl.org/xrp-testnet-faucet.html
2. **Click:** "Generate Faucet Credentials"
3. **Save:**
   ```
   Buyer Address: rABC123...
   Buyer Secret: sEdT...  (KEEP PRIVATE!)
   ```

### Step 2: Create Seller Wallet

1. **Go to:** https://xrpl.org/xrp-testnet-faucet.html
2. **Click:** "Generate Faucet Credentials" (again)
3. **Save:**
   ```
   Seller Address: rXYZ789...
   Seller Secret: sEdS...  (KEEP PRIVATE!)
   ```

### Step 3: Import Buyer Wallet to Crossmark

1. **Open Crossmark**
2. **Settings → Add Account → Import**
3. **Paste buyer secret**
4. **Switch to Testnet**
5. **Use this to buy products**

### Step 4: Update Marketplace

```bash
./setup-wallets.sh rYourSellerAddressHere
```

### Step 5: Test (Same as Method 1, Step 5)

---

## 🧪 Testing Checklist

### Before Purchase:
- [ ] Buyer wallet funded (at least 50 XRP)
- [ ] Seller wallet created and activated
- [ ] Seller address updated in mockProducts.ts
- [ ] Dev server running (npm run dev)
- [ ] Crossmark connected as BUYER

### During Purchase:
- [ ] Connected correct wallet (buyer)
- [ ] Selected a product
- [ ] Clicked "Buy Now"
- [ ] Reviewed transaction in Crossmark
- [ ] Approved transaction
- [ ] Received transaction hash

### After Purchase:
- [ ] Transaction shows on explorer
- [ ] Status: tesSUCCESS
- [ ] Buyer balance decreased
- [ ] Escrow visible on explorer
- [ ] Destination = Seller address

### Fund Transfer Verification:
- [ ] Escrow created successfully
- [ ] Funds locked (not in buyer wallet)
- [ ] Seller has pending escrow
- [ ] Can finish escrow after 7 days
- [ ] Funds released to seller

---

## 📊 Balance Tracking Sheet

| Stage | Buyer Balance | Seller Balance | Escrow Amount |
|-------|--------------|----------------|---------------|
| Initial | 1000 XRP | 1000 XRP | 0 XRP |
| After Purchase | ~996 XRP | 1000 XRP | 3.99 XRP |
| After Finish | ~996 XRP | 1003.99 XRP | 0 XRP |

---

## 🔍 Verification Commands

### Check Buyer Balance:
```bash
# In browser:
https://testnet.xrpl.org/accounts/rYourBuyerAddress
```

### Check Seller Balance:
```bash
# In browser:
https://testnet.xrpl.org/accounts/rYourSellerAddress
```

### Check Escrow Details:
```bash
# In browser:
https://testnet.xrpl.org/transactions/YourTxHash
```

### View All Escrows:
```bash
# On seller account page, click "Objects" tab
# You'll see pending escrows
```

---

## 🎯 Quick Test Script

Save this as `test-transfer.sh`:

```bash
#!/bin/bash

BUYER_ADDRESS="rYourBuyerAddress"
SELLER_ADDRESS="rYourSellerAddress"

echo "🧪 Testing Fund Transfer"
echo "========================"
echo ""
echo "1️⃣ Buyer Address: $BUYER_ADDRESS"
echo "   Check: https://testnet.xrpl.org/accounts/$BUYER_ADDRESS"
echo ""
echo "2️⃣ Seller Address: $SELLER_ADDRESS"
echo "   Check: https://testnet.xrpl.org/accounts/$SELLER_ADDRESS"
echo ""
echo "3️⃣ Next Steps:"
echo "   - Connect Crossmark with BUYER wallet"
echo "   - Buy a product"
echo "   - Check both addresses above"
echo "   - Verify escrow created"
echo ""
```

Make it executable:
```bash
chmod +x test-transfer.sh
./test-transfer.sh
```

---

## 🆘 Troubleshooting

### "Can't switch accounts in Crossmark"
→ Make sure you clicked "Add Account" not "Switch Network"

### "Seller wallet not showing escrow"
→ Check "Objects" tab on explorer, not just transactions

### "Balance didn't change"
→ Escrow locks funds - they're not transferred until escrow finishes

### "How to finish escrow?"
→ After 7 days, or use the escrowFinish.js script in src/app/transactions/

---

## 🎓 What You'll Learn

✅ **Real blockchain transactions** (not simulated)  
✅ **How escrow works** (locked funds)  
✅ **Multi-signature flows** (buyer creates, seller claims)  
✅ **Balance tracking** (on-chain verification)  
✅ **Time-locked contracts** (7-day protection)  

---

## 📚 Additional Resources

- **Crossmark Docs:** https://docs.crossmark.io
- **XRPL Escrow:** https://xrpl.org/escrow.html
- **Testnet Explorer:** https://testnet.xrpl.org
- **Testnet Faucet:** https://xrpl.org/xrp-testnet-faucet.html

---

## ✨ Pro Tips

💡 **Use descriptive names:**
```
Profile 1: "Marketplace Buyer" 
Profile 2: "Marketplace Seller"
```

💡 **Keep notes:**
```
Buyer: rABC123...
Seller: rXYZ789...
Test TX: ABC123DEF456...
```

💡 **Test small amounts first:**
```
Start with cheapest product (3.99 XRP)
Verify everything works
Then test larger amounts
```

💡 **Screenshot everything:**
- Before balances
- Transaction hash
- After balances
- Escrow details

---

**Ready to test real fund transfers?** Follow Method 1 above! 🚀
