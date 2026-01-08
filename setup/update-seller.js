#!/usr/bin/env node
/**
 * Quick script to update seller addresses in mockProducts.ts
 * Usage: node update-seller.js rYourSellerAddressHere
 */

const fs = require('fs');
const path = require('path');

// Get seller address from command line
const sellerAddress = process.argv[2];

if (!sellerAddress) {
  console.error('❌ Error: Please provide a seller address');
  console.log('\nUsage: node update-seller.js rYourSellerAddressHere');
  console.log('\nExample: node update-seller.js rN7n7otQDd6FczFgLdllcK85EQ4jgvnM\n');
  process.exit(1);
}

// Validate address format (basic check)
if (!sellerAddress.startsWith('r') || sellerAddress.length < 25) {
  console.error('❌ Error: Invalid XRPL address format');
  console.log('Address should start with "r" and be at least 25 characters long\n');
  process.exit(1);
}

// Path to mockProducts.ts
const filePath = path.join(__dirname, 'src', 'lib', 'mockProducts.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences of placeholder or old addresses
const placeholders = [
  'YOUR_CROSSMARK_WALLET_ADDRESS_HERE',
  'rN7n7otQDd6FczFgLdllcK85EQ4jgvnM' // Old placeholder
];

let replacementCount = 0;
placeholders.forEach(placeholder => {
  const regex = new RegExp(`seller: "${placeholder}"`, 'g');
  const matches = content.match(regex);
  if (matches) {
    replacementCount += matches.length;
    content = content.replace(regex, `seller: "${sellerAddress}"`);
  }
});

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Successfully updated seller addresses!\n');
console.log(`   Replaced: ${replacementCount} occurrences`);
console.log(`   New seller address: ${sellerAddress}`);
console.log(`   File: ${filePath}\n`);
console.log('🚀 Ready to test! Run: npm run dev\n');
