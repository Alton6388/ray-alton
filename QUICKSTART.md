# 🎯 Quick Start: Two-Wallet Setup

## What You're Setting Up

```
┌─────────────────────────────────────────────────────────────┐
│                    XRPL MARKETPLACE FLOW                     │
└─────────────────────────────────────────────────────────────┘

    BUYER (You)                           SELLER (Test Wallet)
    ┌──────────┐                          ┌──────────┐
    │Crossmark │                          │Test Addr │
    │  Wallet  │                          │rN7n7...  │
    └────┬─────┘                          └────┬─────┘
         │                                     │
         │  1. Connect to Marketplace          │
         ├─────────────────────────────────────┤
         │                                     │
         │  2. Click "Buy Product"             │
         ├────────────────────────────────────>│
         │     Create Escrow                   │
         │     Amount: 5.99 XRP               │
         │     Destination: Seller             │
         │     Protection: 7 days              │
         │                                     │
         │  3. Escrow Created ✅               │
         │<────────────────────────────────────┤
         │     Transaction Hash: ABC123...     │
         │     View on Explorer                │
         │                                     │
         │  4. Seller Delivers Product         │
         │<────────────────────────────────────│
         │                                     │
         │  5. Finish Escrow (Optional)        │
         ├────────────────────────────────────>│
         │     Seller Receives Payment         │
         └─────────────────────────────────────┘
```

---

## 🚀 Step-by-Step Instructions

### **Step 1: Create Seller Wallet** (2 minutes)

I've opened the XRPL Testnet Faucet in your browser. Now:

1. **On the faucet page:**
   - Click **"Generate Faucet Credentials"**
   - Wait for the wallet to be created (5 seconds)

2. **You'll see something like this:**
   ```
   Address: rN7n7otQDd6FczFgLdllcK85EQ4jgvnM
   Secret: sEdTM1uX8pu2do5XvTnutH6HsouHcun
   XRP: 1000
   ```

3. **Copy the ADDRESS** (starts with `r`)
   - ⚠️ **DO NOT share the secret publicly**
   - This is just for testing

---

### **Step 2: Update Your Marketplace** (30 seconds)

In your terminal, run:

```bash
cd /Users/altontan/Documents/GitHub/IS2108/ray-alton

# Replace with YOUR seller address from the faucet
./setup-wallets.sh rN7n7otQDd6FczFgLdllcK85EQ4jgvnM
```

Or use the quick update:

```bash
node update-seller.js rN7n7otQDd6FczFgLdllcK85EQ4jgvnM
```

---

### **Step 3: Test the Marketplace** (5 minutes)

```bash
# Start the dev server
npm run dev
```

Then in your browser:

1. **Open:** `http://localhost:3001`
2. **Connect:** Your Crossmark wallet (buyer)
3. **Browse:** Pick any product
4. **Buy:** Click "Buy Now" → Approve transaction
5. **Success:** You'll see transaction hash! 🎉

---

## 🎯 What Happens

### Before (❌ Error)
```
Buyer → Escrow → Unactivated Seller ❌
"Destination account not activated"
```

### After (✅ Success)
```
Buyer → Escrow → Activated Seller ✅
Transaction: ABC123...
View on: testnet.xrpl.org
```

---

## 🔍 Verify Your Transaction

After purchase, you'll get a transaction hash. Check it:

```
https://testnet.xrpl.org/transactions/YOUR_HASH_HERE
```

You should see:
- ✅ Transaction Type: EscrowCreate
- ✅ Status: Success (tesSUCCESS)
- ✅ Amount: 5.99 XRP (or whatever you bought)
- ✅ Destination: Your seller address
- ✅ Cancel After: 7 days from now

---

## 💡 Pro Tips

### Test Different Products
- **Cheapest:** Market Analysis Report (3.99 XRP)
- **XRP Product:** Crypto Dashboard (5.99 XRP)
- **RLUSD Product:** AI Trading Bot (9.99 RLUSD)

### Multiple Sellers (Optional)
Create different seller addresses for different products:
```bash
# Update individual products in mockProducts.ts
# Give each product a different seller address
```

### Check Wallet Balance
- **Buyer:** Your Crossmark → Should decrease after purchase
- **Seller:** Check on explorer → Should show pending escrow

---

## 🆘 Troubleshooting

### "Destination not activated"
→ Make sure you used the address from the faucet (it's auto-funded)

### "Insufficient XRP"
→ Fund your Crossmark wallet using the faucet

### "Transaction failed"
→ Check browser console (F12) for detailed error

---

## 📞 Need Help?

Run the setup script without arguments for a reminder:
```bash
./setup-wallets.sh
```

Check documentation:
- `WALLET_SETUP.md` - Detailed wallet guide
- `SETUP_GUIDE.md` - Full marketplace setup
- `CROSSMARK_INTEGRATION_GUIDE.md` - Wallet integration

---

## ✅ Checklist

- [ ] Created seller wallet on testnet faucet
- [ ] Copied seller address (starts with 'r')
- [ ] Ran `./setup-wallets.sh rYourAddress`
- [ ] Started dev server (`npm run dev`)
- [ ] Connected Crossmark wallet
- [ ] Made test purchase
- [ ] Saw success message with transaction hash
- [ ] Verified on XRPL Explorer

---

**Ready?** Let's create your seller wallet! 🚀

The faucet is already open in your browser. Click "Generate Faucet Credentials" and copy the address!
