# Test Wallet Setup Guide

## Creating a Seller Test Wallet for XRPL Marketplace

### Method 1: Using XRPL Testnet Faucet (Recommended)

1. **Generate a New Wallet:**
   - Visit: https://xrpl.org/xrp-testnet-faucet.html
   - Click "Generate Faucet Credentials"
   - This will create a new wallet AND fund it with 1000 test XRP
   - Save the address (starts with 'r')
   - Save the secret (KEEP THIS PRIVATE - only for testing)

2. **Copy the Wallet Address:**
   - The address will look like: `rN7n7otQDd6FczFgLdllcK85EQ4jgvnM`
   - This is your SELLER wallet address

3. **Update the Marketplace:**
   - Open `src/lib/mockProducts.ts`
   - Replace `YOUR_CROSSMARK_WALLET_ADDRESS_HERE` with the new address

### Method 2: Using Crossmark (Second Profile)

1. **Open Crossmark Extension**
2. **Click Settings → Add Account**
3. **Create New Wallet** or **Import Existing**
4. **Switch to the new account**
5. **Copy the address**
6. **Fund it using the faucet:**
   - Visit: https://xrpl.org/xrp-testnet-faucet.html
   - Paste your new address
   - Click "Get Test XRP"

### Method 3: Using XUMM Wallet

1. **Download XUMM:** https://xumm.app
2. **Create Testnet Wallet** (Settings → Advanced → Network → Testnet)
3. **Copy address**
4. **Fund via faucet:** https://xrpl.org/xrp-testnet-faucet.html

---

## Testing Flow

### Buyer Wallet (Your Main Crossmark)
- Use this to connect to the marketplace
- Use this to purchase products
- This creates the escrow

### Seller Wallet (Newly Created)
- Listed in product.seller field
- Receives escrow destination
- Can finish/claim escrow after delivery

---

## Security Notes

⚠️ **TESTNET ONLY:**
- These are test wallets with NO real value
- Never use testnet secrets on mainnet
- Never share real mainnet secrets

✅ **Best Practices:**
- Keep buyer and seller wallets separate
- Document which wallet is which
- Test small amounts first (under 10 XRP)

---

## Quick Reference

| Wallet | Purpose | Network |
|--------|---------|---------|
| Your Crossmark | Buyer (Customer) | Testnet |
| New Test Wallet | Seller (Merchant) | Testnet |

---

## Next Steps

1. ✅ Create seller wallet using faucet
2. ✅ Copy the address
3. ✅ Update `mockProducts.ts` with seller address
4. ✅ Test purchase flow
5. ✅ Verify transaction on XRPL Explorer
