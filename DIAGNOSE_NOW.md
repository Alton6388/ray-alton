# 🔍 Quick Escrow Diagnostic Guide

## Your Failed Transaction

You mentioned transaction hash: `C1EF8E6A5122ADCEC91F7CCD36567B786D9B763048A037C`

**⚠️ This hash appears incomplete** (should be 64 characters). Please get the full hash.

## Immediate Steps to Investigate

### Step 1: Check the Transaction

**Option A: Web Explorer (Easiest)**
1. Go to: https://testnet.xrpl.org
2. Paste your FULL transaction hash
3. Look for these key fields:
   - **TransactionResult**: Should be `tesSUCCESS` (if not, this is your error code)
   - **TransactionType**: Should be `EscrowCreate` or `EscrowFinish`
   - **Sequence**: The number you need for finishing escrow
   - **Account**: The owner address (buyer who created escrow)

**Option B: Use Diagnostic Script**
```bash
node diagnose-escrow.js --tx YOUR_FULL_TRANSACTION_HASH
```

### Step 2: Check Your Wallet Addresses

Get your buyer and seller addresses, then run:

```bash
# Check buyer wallet and any escrows
node diagnose-escrow.js rYourBuyerAddress

# Check both buyer and seller
node diagnose-escrow.js rYourBuyerAddress rYourSellerAddress
```

This will show you:
- ✅ Account balances
- ✅ Active escrows
- ✅ Whether escrows are ready to finish
- ✅ Exact sequence numbers needed

## Common Transaction Failures

### ❌ `tecNO_DST_INSUF_XRP`
**Problem**: Seller wallet not activated
**Solution**: 
1. Go to https://xrpl.org/resources/dev-tools/xrp-faucets
2. Enter seller address
3. Click "Generate Testnet credentials" or "Get Testnet XRP"
4. Wait for 10 XRP to arrive
5. Try creating escrow again

### ❌ `tecUNFUNDED_ESCROW`
**Problem**: Buyer doesn't have enough XRP
**Solution**:
1. Check buyer balance: https://testnet.xrpl.org (search your address)
2. Get more testnet XRP from faucet
3. You need: Product Price + 20 XRP reserve + transaction fees

### ❌ `tecNO_TARGET`
**Problem**: Escrow doesn't exist
**Causes**:
- Wrong sequence number
- Escrow already finished/cancelled  
- Wrong owner address

**Solution**: Run diagnostic to see if escrow exists

### ❌ `tefMAX_LEDGER` or "escrowNotReady"
**Problem**: Trying to finish too early
**Solution**: Wait at least 1 minute after creating escrow

## Quick Checks

### Is Buyer Wallet Funded?
```bash
# Check on explorer
https://testnet.xrpl.org → Search your buyer address
# Should show: Balance > 20 XRP
```

### Is Seller Wallet Activated?
```bash
# Check on explorer  
https://testnet.xrpl.org → Search your seller address
# Should NOT show "Account not found"
```

### Does Escrow Exist?
```bash
# Check on explorer
https://testnet.xrpl.org → Search buyer address → Click "Objects" tab
# Should show at least one Escrow object
```

### Can Escrow Be Finished?
```bash
# Check current time
node -e "console.log('Current Unix time:', Math.floor(Date.now()/1000))"

# Compare with FinishAfter time from escrow object
# Current time must be > FinishAfter
```

## What to Do Right Now

### 1. Get Full Transaction Hash
Look in:
- Browser alert after purchase
- Browser console (F12) logs
- Crossmark wallet history

### 2. Run Diagnostic
```bash
# Check your specific transaction
node diagnose-escrow.js --tx FULL_TRANSACTION_HASH

# Then check your account
node diagnose-escrow.js YOUR_BUYER_ADDRESS YOUR_SELLER_ADDRESS
```

### 3. Share Results
If still stuck, share:
- Full transaction hash
- Buyer address
- Seller address  
- Error message from TransactionResult
- Output from diagnostic script

## Testing New Purchase

To test if setup is correct:

### Before Buying:
```bash
# 1. Verify both wallets
node diagnose-escrow.js rBuyerAddress rSellerAddress
# Both should show "ACTIVE" with sufficient balance

# 2. Check network in Crossmark
# Must be on "Testnet" not "Mainnet"
```

### After Buying (Immediate):
```bash
# 1. Copy the transaction hash from alert
# 2. Check it on explorer immediately
https://testnet.xrpl.org → Paste hash → Check TransactionResult

# 3. Run diagnostic
node diagnose-escrow.js --tx YOUR_TX_HASH
```

### After 1 Minute:
```bash
# 1. Check if escrow is ready
node diagnose-escrow.js rBuyerAddress

# 2. If ready, go to /escrow page and finish it
# Use the Owner Address and Sequence from diagnostic output
```

## Example: Full Test Flow

```bash
# Start diagnostic
echo "=== Starting Escrow Test ==="

# 1. Check initial state
echo "\n1. Checking accounts..."
node diagnose-escrow.js rBuyerAddress rSellerAddress

# 2. Buy a product (manual step on website)
echo "\n2. Buy a product on the website"
echo "   Save the transaction hash!"
read -p "Enter transaction hash: " TX_HASH

# 3. Check transaction
echo "\n3. Checking transaction..."
node diagnose-escrow.js --tx $TX_HASH

# 4. Wait 1 minute
echo "\n4. Waiting 60 seconds..."
sleep 60

# 5. Check if ready to finish
echo "\n5. Checking escrow status..."
node diagnose-escrow.js rBuyerAddress

# 6. Finish escrow (manual step on /escrow page)
echo "\n6. Go to /escrow page and finish the escrow"
echo "   Use the Owner Address and Sequence from above"
```

## Still Having Issues?

1. **Check TROUBLESHOOTING_ESCROW.md** - Comprehensive error guide
2. **Run diagnostic** - Get exact error codes
3. **Check explorer** - See transaction details
4. **Verify wallets** - Both activated on Testnet
5. **Check timing** - Wait full 1 minute

## Your Specific Case

Based on your hash `C1EF8E6A5122ADCEC91F7CCD36567B786D9B763048A037C`:

1. **Get the complete hash** (this one is too short)
2. **Check on explorer**: https://testnet.xrpl.org
3. **Look for TransactionResult** - This tells you exactly what failed
4. **Run diagnostic**: 
   ```bash
   node diagnose-escrow.js --tx FULL_HASH
   ```

**Most Likely Issues**:
- ❌ Seller wallet not activated → Use testnet faucet
- ❌ Insufficient buyer balance → Get more testnet XRP  
- ❌ Wrong network → Switch Crossmark to Testnet
- ❌ Tried to finish too early → Wait 1 minute

---

**Need more help?** Share your:
- Full transaction hash
- Buyer address  
- Seller address
- Screenshot of error
- Output from `node diagnose-escrow.js YOUR_BUYER_ADDRESS`
