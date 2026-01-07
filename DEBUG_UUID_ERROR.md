# 🔍 Debugging "Unknown error" / UUID Response

## Problem

When clicking "Confirm Product Received & Release Funds", you see:
```
❌ Failed
Transaction failed: Unknown error
```

In the console, you see a UUID like:
```
Transaction result: 31faa0ac-56e1-4b2d-9bea-5aeee1e0fffb
```

---

## What This Means

A **UUID response** from Crossmark indicates:
- ✅ Transaction was **submitted** to Crossmark
- ❌ But the actual **transaction hash** wasn't returned
- 🔄 The transaction might be **pending** or **rejected**

This typically happens when:
1. **Network latency** - Transaction submitted but not yet validated
2. **Rejected by user** - You cancelled the transaction in Crossmark
3. **Network mismatch** - Wrong network (Testnet vs Mainnet)
4. **Escrow not ready** - Trying to finish before `FinishAfter` time
5. **Invalid parameters** - Wrong Owner Address or Sequence Number

---

## Step-by-Step Debugging

### Step 1: Check Browser Console

Open DevTools (F12) and look for these logs:

```javascript
// Good flow:
✅ Crossmark extension is ready
🔓 Finishing escrow...
Owner (Buyer): r66iGAiNwGZc11woxWbkeYDhFXeiFTDyb
Offer Sequence: 13843538
📝 EscrowFinish transaction: { ... }
🔐 Attempting to sign and submit transaction...
✅ Using window.crossmark.signAndSubmit
✅ Transaction result: { hash: "ABC123...", meta: { TransactionResult: "tesSUCCESS" } }
🔑 Extracted Hash: ABC123...
📋 Transaction Result: tesSUCCESS
```

```javascript
// Bad flow (UUID):
✅ Crossmark extension is ready
🔓 Finishing escrow...
📝 EscrowFinish transaction: { ... }
🔐 Attempting to sign and submit transaction...
✅ Transaction result: 31faa0ac-56e1-4b2d-9bea-5aeee1e0fffb  ❌ UUID!
⏳ Transaction submitted with request ID: 31faa0ac-...
```

### Step 2: Check Crossmark Popup

When you click "Confirm Product Received", Crossmark should show a popup:

**What to Look For:**
- Did you **approve** or **reject** the transaction?
- Does it show the correct **network** (Testnet)?
- Does it show the correct **transaction type** (EscrowFinish)?
- Are the **Owner** and **OfferSequence** correct?

**Common Issues:**
- ❌ Popup didn't appear → Extension might be blocked
- ❌ Rejected by user → You clicked "Cancel"
- ❌ Wrong network → Switch to Testnet in Crossmark settings

### Step 3: Verify Escrow Details

The most common cause is **incorrect escrow parameters**.

#### Get the Correct Values:

1. **Find your EscrowCreate transaction hash** (from when you purchased)
   
2. **Go to XRPL Testnet Explorer:**
   ```
   https://testnet.xrpl.org
   ```

3. **Search for your transaction hash**

4. **Look for these fields:**
   ```json
   {
     "TransactionType": "EscrowCreate",
     "Account": "r66iGAiNwGZc11woxWbkeYDhFXeiFTDyb",  ← This is Owner Address
     "Sequence": 13843538,                             ← This is Offer Sequence
     "Destination": "rpVh7YjJTokEm5GSAVbSP6JSCVH1XKuDxN",
     "Amount": "3990000",
     "FinishAfter": 1234567890,                        ← Must be in the past!
     "CancelAfter": 1234567890
   }
   ```

5. **Copy the exact values:**
   - Owner Address = `Account` field
   - Offer Sequence = `Sequence` field

### Step 4: Check Timing (FinishAfter)

Escrows have a **FinishAfter** time. You **cannot** finish an escrow before this time!

**Check if enough time has passed:**

1. Find `FinishAfter` value in your EscrowCreate transaction
2. It's a Ripple timestamp (seconds since January 1, 2000)
3. For testing, we set it to **1 minute** after creation

**Example:**
```
EscrowCreate Time: 10:30:00 AM
FinishAfter: 10:31:00 AM  (1 minute later)
Current Time: 10:30:30 AM  ❌ TOO EARLY!
Current Time: 10:31:30 AM  ✅ OK!
```

**If you try too early, you'll see:**
```
Transaction failed: terPRE_SEQ or escrowNotReady
```

### Step 5: Check Network

**Verify you're on Testnet:**

1. Open Crossmark extension
2. Click Settings (⚙️ gear icon)
3. Click "Network"
4. Should show: **"Testnet"** or **"Test Net"**
5. If it shows "Mainnet" → Switch to Testnet!

### Step 6: Verify Wallet

**Make sure you're using the correct wallet:**

The wallet you're using to **finish** the escrow can be:
- ✅ The **buyer** wallet (who created the escrow)
- ✅ The **seller** wallet (who receives the funds)

But the **Owner Address** field must be the **buyer's address** (who created the escrow).

---

## Solutions

### Solution 1: Wait and Retry

If you see a UUID:
1. Wait **30 seconds**
2. Check your wallet balance
3. Try the transaction again

### Solution 2: Verify Parameters

1. Double-check **Owner Address** matches `Account` in EscrowCreate
2. Double-check **Offer Sequence** matches `Sequence` in EscrowCreate
3. Use copy/paste - don't type manually!

### Solution 3: Check Timing

1. Look at your EscrowCreate transaction on XRPL Explorer
2. Find `FinishAfter` timestamp
3. Wait until that time has passed
4. For testing escrows: **Wait at least 1 minute** after purchase

### Solution 4: Clear and Reconnect

1. Disconnect wallet from marketplace
2. Close Crossmark extension completely
3. Reopen Crossmark
4. Reconnect to marketplace
5. Try again

### Solution 5: Check Escrow Exists

The escrow might have been:
- ❌ Already finished
- ❌ Cancelled
- ❌ Never created successfully

**To verify:**
1. Go to https://testnet.xrpl.org
2. Search for the **Owner Address** (buyer's address)
3. Look at recent transactions
4. Find your EscrowCreate transaction
5. Check if there's already an EscrowFinish or EscrowCancel

---

## Testing the Fix

After applying the improved error handling, you should now see **specific error messages** instead of "Unknown error":

### Improved Error Messages:

```
✅ "Escrow finished successfully! Funds released to seller."

❌ "Escrow not found. Check the Owner Address and Offer Sequence."

❌ "You do not have permission to finish this escrow."

❌ "Escrow cannot be finished yet (FinishAfter time not reached)."

❌ "Invalid offer sequence number."

❌ "Transaction submitted but confirmation not available yet. 
    This might indicate a network issue or the transaction is still pending."
```

---

## Console Debugging Commands

Open DevTools console and run:

```javascript
// Check Crossmark connection
console.log("Crossmark:", window.crossmark);
console.log("Session:", window.crossmark?.session);
console.log("Address:", window.crossmark?.session?.address);
console.log("Network:", window.crossmark?.session?.network);

// Check if methods exist
console.log("signAndSubmit:", typeof window.crossmark?.signAndSubmit);
console.log("methods.signAndSubmit:", typeof window.crossmark?.methods?.signAndSubmit);
console.log("async.signAndSubmit:", typeof window.crossmark?.async?.signAndSubmit);
```

Expected output:
```
Crossmark: Object { session: {...}, signAndSubmit: function }
Session: Object { address: "r66i...", network: "Testnet" }
Address: r66iGAiNwGZc11woxWbkeYDhFXeiFTDyb
Network: Testnet
signAndSubmit: function
```

---

## Still Not Working?

### Last Resort Checklist:

1. ✅ Crossmark installed and unlocked
2. ✅ On Testnet (not Mainnet)
3. ✅ Owner Address is correct (copy from XRPL Explorer)
4. ✅ Offer Sequence is correct (copy from XRPL Explorer)
5. ✅ At least 1 minute passed since EscrowCreate
6. ✅ Escrow hasn't been finished or cancelled already
7. ✅ Have enough XRP for transaction fee (12 drops = 0.000012 XRP)
8. ✅ Approved transaction in Crossmark popup

### Get Help:

If all else fails, share these details:
- Console logs (all messages)
- EscrowCreate transaction hash
- Owner Address used
- Offer Sequence used
- Current wallet address
- Network (Testnet/Mainnet)
- Full error message

---

## Summary

**UUID Response = Transaction submitted but not validated**

**Most Common Causes:**
1. Wrong Owner Address or Offer Sequence
2. Trying to finish before FinishAfter time (wait 1 minute)
3. Escrow already finished/cancelled
4. Wrong network (Mainnet instead of Testnet)

**Quick Fix:**
- Wait 1+ minute after purchase
- Copy exact values from XRPL Explorer
- Make sure you're on Testnet
- Approve the transaction in Crossmark popup

With the new error handling, you'll get specific messages telling you exactly what went wrong! 🎉
