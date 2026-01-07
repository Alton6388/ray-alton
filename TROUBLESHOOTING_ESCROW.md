# 🔧 Troubleshooting Escrow Transactions

## Common Escrow Errors & Solutions

### 1. **Transaction Submitted But Not Successful**

If you see "Transaction was submitted but not successful", check the transaction on the explorer:

**Steps:**
1. Go to https://testnet.xrpl.org
2. Paste your transaction hash
3. Look for the `TransactionResult` field

**Common Error Codes:**

#### `tecNO_DST_INSUF_XRP`
- **Problem**: Destination wallet (seller) doesn't have enough XRP to exist
- **Solution**: Send at least 10 XRP to the seller wallet to activate it
- **Command**: Use Testnet faucet at https://xrpl.org/resources/dev-tools/xrp-faucets

#### `tecUNFUNDED_ESCROW`
- **Problem**: You don't have enough XRP in your wallet
- **Solution**: 
  1. Check your balance: https://testnet.xrpl.org (search your address)
  2. Get testnet XRP: https://xrpl.org/resources/dev-tools/xrp-faucets
  3. Make sure you have: Product Price + Reserve (20 XRP) + Transaction Fees

#### `tecNO_PERMISSION`
- **Problem**: You don't have permission to execute this transaction
- **Solution**: Make sure you're using the correct wallet (buyer wallet for EscrowFinish)

#### `tecNO_TARGET`
- **Problem**: The escrow object doesn't exist
- **Solutions**:
  - Wrong sequence number
  - Escrow already finished/cancelled
  - Wrong owner address

#### `escrowNotReady` (tefMAX_LEDGER)
- **Problem**: Trying to finish escrow before FinishAfter time
- **Solution**: Wait at least 1 minute after creating the escrow
- **Check**: Look at the escrow's FinishAfter timestamp on the explorer

---

## 2. **How to Check if Escrow Exists**

### Method 1: XRPL Explorer
1. Go to https://testnet.xrpl.org
2. Search for your **buyer wallet address**
3. Click "Objects" tab
4. Look for "Escrow" objects
5. Check the:
   - `Amount`: Should match your purchase
   - `Destination`: Should be seller address
   - `FinishAfter`: Unix timestamp when you can finish
   - `PreviousTxnID`: The EscrowCreate transaction hash

### Method 2: Programmatically
```javascript
// In browser console
const response = await fetch('https://s.altnet.rippletest.net:51234/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'account_objects',
    params: [{
      account: 'rYOUR_BUYER_ADDRESS',
      type: 'escrow'
    }]
  })
});
const data = await response.json();
console.log('Escrows:', data.result.account_objects);
```

---

## 3. **Verifying Transaction Details**

### For EscrowCreate (Buy Transaction)

**Required Fields:**
- ✅ `TransactionType: "EscrowCreate"`
- ✅ `Account`: Your buyer address
- ✅ `Amount`: String of drops (XRP * 1000000)
- ✅ `Destination`: Seller address (must be activated!)
- ✅ `FinishAfter`: Unix timestamp (now + 60 seconds for testing)
- ✅ `CancelAfter`: Unix timestamp (now + 7 days)

**Example:**
```json
{
  "TransactionType": "EscrowCreate",
  "Account": "rBuyerAddress...",
  "Amount": "9990000",
  "Destination": "rSellerAddress...",
  "FinishAfter": 1234567890,
  "CancelAfter": 1234654321,
  "Fee": "12"
}
```

### For EscrowFinish (Release Funds)

**Required Fields:**
- ✅ `TransactionType: "EscrowFinish"`
- ✅ `Account`: Can be buyer OR seller
- ✅ `Owner`: The address that created the escrow (buyer)
- ✅ `OfferSequence`: Sequence number from EscrowCreate transaction

**Example:**
```json
{
  "TransactionType": "EscrowFinish",
  "Account": "rBuyerOrSellerAddress...",
  "Owner": "rBuyerAddress...",
  "OfferSequence": 12345678,
  "Fee": "12"
}
```

---

## 4. **Common Mistakes**

### ❌ Mistake 1: Inactive Seller Wallet
**Problem:** Seller address never received XRP before
**Solution:** Send at least 10 XRP to seller wallet first

### ❌ Mistake 2: Wrong Network
**Problem:** Buyer on Testnet, Seller on Mainnet (or vice versa)
**Solution:** Both wallets must be on the same network

### ❌ Mistake 3: Amount Not a String
**Problem:** `Amount: 9990000` (number) instead of `"9990000"` (string)
**Solution:** Always convert to string: `amount.toString()`

### ❌ Mistake 4: Missing FinishAfter
**Problem:** EscrowCreate without FinishAfter or Condition
**Solution:** Add both FinishAfter AND CancelAfter

### ❌ Mistake 5: Wrong Sequence Number
**Problem:** Using transaction hash instead of sequence number
**Solution:** Look for "Sequence" field in transaction details (it's a number like 12345678)

### ❌ Mistake 6: Finishing Too Early
**Problem:** Trying to finish before FinishAfter time
**Solution:** Wait until current time > FinishAfter timestamp

---

## 5. **Step-by-Step Debugging**

### For Failed EscrowCreate:

1. **Check Buyer Balance**
   ```
   https://testnet.xrpl.org → Search buyer address → Check XRP balance
   Required: Product Price + 20 XRP reserve + fees
   ```

2. **Check Seller Is Activated**
   ```
   https://testnet.xrpl.org → Search seller address
   If "Account not found" → Seller needs activation (send 10 XRP)
   ```

3. **Verify Transaction Details**
   ```
   https://testnet.xrpl.org → Paste transaction hash
   Look at TransactionResult field
   ```

4. **Check Transaction Logs**
   ```
   Open browser console (F12) → Look for errors
   Check Network tab for failed requests
   ```

### For Failed EscrowFinish:

1. **Verify Escrow Exists**
   ```
   Go to buyer address → Objects tab → Should see Escrow
   ```

2. **Check FinishAfter Time**
   ```
   Current Unix time: Math.floor(Date.now() / 1000)
   Escrow FinishAfter: (from Objects tab)
   Current time must be > FinishAfter
   ```

3. **Verify Sequence Number**
   ```
   Go to EscrowCreate transaction → Look for "Sequence" field
   NOT the transaction hash!
   ```

4. **Check Owner Address**
   ```
   Must be the exact address that created the escrow (buyer)
   Check Account field in EscrowCreate transaction
   ```

---

## 6. **Testing Checklist**

### Before Creating Escrow:
- [ ] Buyer wallet has sufficient XRP (price + 20 + fees)
- [ ] Seller wallet is activated (has received XRP before)
- [ ] Both wallets on Testnet
- [ ] Crossmark connected and unlocked
- [ ] Product price under $10 for testing

### After Creating Escrow:
- [ ] Transaction hash received
- [ ] Transaction result is `tesSUCCESS`
- [ ] Escrow appears in buyer's Objects tab
- [ ] Note down the Sequence number
- [ ] Wait 1 minute before finishing

### Before Finishing Escrow:
- [ ] At least 1 minute has passed
- [ ] Have correct Owner address (buyer)
- [ ] Have correct Sequence number
- [ ] Crossmark connected
- [ ] Escrow still exists (not already finished)

### After Finishing Escrow:
- [ ] Transaction hash received
- [ ] Transaction result is `tesSUCCESS`
- [ ] Escrow disappears from buyer's Objects tab
- [ ] Seller balance increased by escrow amount

---

## 7. **Quick Diagnostic Commands**

Run these in browser console (F12) while on the marketplace:

```javascript
// Check Crossmark connection
console.log('Crossmark:', window.crossmark);
console.log('Session:', window.crossmark?.session);
console.log('Address:', window.crossmark?.session?.address);
console.log('Network:', window.crossmark?.session?.network);

// Convert current time to Unix timestamp
const now = Math.floor(Date.now() / 1000);
console.log('Current Unix time:', now);
console.log('Current time:', new Date().toLocaleString());

// Calculate FinishAfter time (1 minute from now)
const finishAfter = now + 60;
console.log('FinishAfter:', finishAfter);
console.log('FinishAfter readable:', new Date(finishAfter * 1000).toLocaleString());

// Convert XRP to drops
const xrp = 9.99;
const drops = Math.floor(xrp * 1000000);
console.log(`${xrp} XRP = ${drops} drops`);
```

---

## 8. **Getting Help**

If you're still stuck:

1. **Check the transaction on explorer**
   - https://testnet.xrpl.org
   - Look for TransactionResult and any error messages

2. **Share these details**:
   - Transaction hash
   - Buyer address
   - Seller address
   - Error message (if any)
   - TransactionResult code

3. **XRPL Documentation**:
   - Escrow: https://xrpl.org/escrow.html
   - Transaction Results: https://xrpl.org/transaction-results.html
   - Error Codes: https://xrpl.org/tec-codes.html

---

## 9. **Your Specific Error**

Based on your transaction hash `C1EF8E6A5122ADCEC91F7CCD36567B786D9B763048A037C`:

**Note**: This hash appears incomplete (usually 64 characters). Please verify the full hash.

**To investigate:**
1. Go to https://testnet.xrpl.org
2. Paste the full transaction hash
3. Look for:
   - `TransactionResult`: The error code
   - `Account`: Who sent it
   - `Destination`: Where it's going
   - `Amount`: How much
   - `Sequence`: The sequence number you need

**Common issues if it's an EscrowCreate**:
- Seller wallet not activated → Send 10 XRP to seller first
- Insufficient buyer balance → Get more testnet XRP
- Wrong network → Both on Testnet

**Common issues if it's an EscrowFinish**:
- Too early → Wait until FinishAfter time passes
- Wrong sequence → Check transaction details for correct number
- Escrow doesn't exist → Verify it wasn't already finished

---

## 10. **Automated Diagnostic Script**

Save this as `diagnose-escrow.js` and run with `node diagnose-escrow.js`:

```javascript
const xrpl = require('xrpl');

async function diagnoseEscrow() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const buyerAddress = 'YOUR_BUYER_ADDRESS';
  const sellerAddress = 'YOUR_SELLER_ADDRESS';

  console.log('\n🔍 ESCROW DIAGNOSTIC REPORT\n');
  console.log('=' .repeat(50));

  // Check buyer account
  try {
    const buyerInfo = await client.request({
      command: 'account_info',
      account: buyerAddress,
      ledger_index: 'validated'
    });
    console.log('\n✅ Buyer Account Status:');
    console.log(`Address: ${buyerAddress}`);
    console.log(`Balance: ${buyerInfo.result.account_data.Balance / 1000000} XRP`);
    console.log(`Sequence: ${buyerInfo.result.account_data.Sequence}`);
  } catch (error) {
    console.log('\n❌ Buyer Account: NOT FOUND or ERROR');
  }

  // Check seller account
  try {
    const sellerInfo = await client.request({
      command: 'account_info',
      account: sellerAddress,
      ledger_index: 'validated'
    });
    console.log('\n✅ Seller Account Status:');
    console.log(`Address: ${sellerAddress}`);
    console.log(`Balance: ${sellerInfo.result.account_data.Balance / 1000000} XRP`);
  } catch (error) {
    console.log('\n❌ Seller Account: NOT ACTIVATED');
    console.log('   Solution: Send at least 10 XRP to seller address');
  }

  // Check for escrows
  try {
    const escrows = await client.request({
      command: 'account_objects',
      account: buyerAddress,
      type: 'escrow',
      ledger_index: 'validated'
    });
    
    if (escrows.result.account_objects.length > 0) {
      console.log('\n📦 Found Escrows:');
      escrows.result.account_objects.forEach((escrow, index) => {
        const amount = escrow.Amount / 1000000;
        const finishAfter = new Date(escrow.FinishAfter * 1000);
        const now = new Date();
        const canFinish = now > finishAfter;
        
        console.log(`\nEscrow ${index + 1}:`);
        console.log(`  Amount: ${amount} XRP`);
        console.log(`  Destination: ${escrow.Destination}`);
        console.log(`  FinishAfter: ${finishAfter.toLocaleString()}`);
        console.log(`  Can Finish: ${canFinish ? '✅ YES' : '❌ NO (wait longer)'}`);
        console.log(`  PreviousTxnID: ${escrow.PreviousTxnID}`);
      });
    } else {
      console.log('\n📦 No active escrows found');
    }
  } catch (error) {
    console.log('\n❌ Error checking escrows:', error.message);
  }

  await client.disconnect();
  console.log('\n' + '='.repeat(50));
}

diagnoseEscrow().catch(console.error);
```

To use:
```bash
npm install xrpl
node diagnose-escrow.js
```

---

**Need more help?** Check the full transaction details on the explorer and share the TransactionResult code!
