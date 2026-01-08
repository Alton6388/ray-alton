#!/usr/bin/env node

/**
 * XRPL Escrow Diagnostic Tool
 * 
 * Usage:
 *   node diagnose-escrow.js <buyer-address> [seller-address]
 * 
 * Example:
 *   node diagnose-escrow.js rABC123... rXYZ789...
 */

const https = require('https');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function xrplRequest(method, params) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      method,
      params: [params]
    });

    const options = {
      hostname: 's.altnet.rippletest.net',
      port: 51234,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function checkAccount(address, label) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`Checking ${label}: ${address}`, 'bright');
  log('='.repeat(60), 'bright');

  try {
    const response = await xrplRequest('account_info', {
      account: address,
      ledger_index: 'validated'
    });

    if (response.result && response.result.account_data) {
      const account = response.result.account_data;
      const balance = parseInt(account.Balance) / 1000000;
      
      log('\n✅ Account Status: ACTIVE', 'green');
      log(`   Balance: ${balance} XRP`, 'cyan');
      log(`   Sequence: ${account.Sequence}`, 'cyan');
      log(`   Owner Count: ${account.OwnerCount}`, 'cyan');
      
      if (balance < 20) {
        log(`   ⚠️  WARNING: Low balance! Need at least 20 XRP reserve + transaction fees`, 'yellow');
      }
      
      return true;
    }
  } catch (error) {
    log('\n❌ Account Status: NOT ACTIVATED', 'red');
    log(`   Error: ${error.message}`, 'red');
    log(`   Solution: Send at least 10 XRP to activate this account`, 'yellow');
    log(`   Testnet Faucet: https://xrpl.org/resources/dev-tools/xrp-faucets`, 'cyan');
    return false;
  }
}

async function checkEscrows(address) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log('Checking for Escrows', 'bright');
  log('='.repeat(60), 'bright');

  try {
    const response = await xrplRequest('account_objects', {
      account: address,
      type: 'escrow',
      ledger_index: 'validated'
    });

    const escrows = response.result?.account_objects || [];
    
    if (escrows.length === 0) {
      log('\n📦 No active escrows found', 'yellow');
      log('   If you just created one, check the transaction status on:', 'cyan');
      log('   https://testnet.xrpl.org', 'cyan');
      return;
    }

    log(`\n📦 Found ${escrows.length} active escrow(s):`, 'green');
    
    const now = Math.floor(Date.now() / 1000);
    
    escrows.forEach((escrow, index) => {
      log(`\n--- Escrow ${index + 1} ---`, 'bright');
      
      const amount = parseInt(escrow.Amount) / 1000000;
      const finishAfter = escrow.FinishAfter;
      const cancelAfter = escrow.CancelAfter;
      const finishDate = new Date(finishAfter * 1000);
      const cancelDate = new Date(cancelAfter * 1000);
      const canFinish = now >= finishAfter;
      const canCancel = now >= cancelAfter;
      
      log(`Amount: ${amount} XRP`, 'cyan');
      log(`Destination: ${escrow.Destination}`, 'cyan');
      log(`Owner: ${escrow.Account}`, 'cyan');
      log(``, 'reset');
      log(`FinishAfter: ${finishAfter} (${finishDate.toLocaleString()})`, 'cyan');
      log(`CancelAfter: ${cancelAfter} (${cancelDate.toLocaleString()})`, 'cyan');
      log(`Current Time: ${now} (${new Date(now * 1000).toLocaleString()})`, 'cyan');
      log(``, 'reset');
      
      if (canFinish) {
        log(`✅ Can FINISH now! (${Math.floor((now - finishAfter) / 60)} minutes ago)`, 'green');
        log(`   To finish, you need:`, 'cyan');
        log(`   • Owner Address: ${escrow.Account}`, 'cyan');
        log(`   • Offer Sequence: Check the PreviousTxnID below on explorer`, 'cyan');
      } else {
        const waitMinutes = Math.ceil((finishAfter - now) / 60);
        log(`⏰ Cannot finish yet. Wait ${waitMinutes} more minute(s)`, 'yellow');
      }
      
      if (canCancel) {
        log(`⚠️  Can CANCEL now (deadline passed)`, 'yellow');
      }
      
      log(``, 'reset');
      log(`PreviousTxnID: ${escrow.PreviousTxnID}`, 'cyan');
      log(`View on Explorer:`, 'cyan');
      log(`https://testnet.xrpl.org/transactions/${escrow.PreviousTxnID}`, 'blue');
    });
    
  } catch (error) {
    log(`\n❌ Error checking escrows: ${error.message}`, 'red');
  }
}

async function checkTransaction(txHash) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`Checking Transaction: ${txHash}`, 'bright');
  log('='.repeat(60), 'bright');

  try {
    const response = await xrplRequest('tx', {
      transaction: txHash,
      binary: false
    });

    if (response.result) {
      const tx = response.result;
      const meta = tx.meta;
      
      log(`\nTransaction Type: ${tx.TransactionType}`, 'cyan');
      log(`Result: ${meta?.TransactionResult || 'Unknown'}`, 
        meta?.TransactionResult === 'tesSUCCESS' ? 'green' : 'red');
      
      if (tx.TransactionType === 'EscrowCreate') {
        log(`\nEscrow Details:`, 'bright');
        log(`  From (Buyer): ${tx.Account}`, 'cyan');
        log(`  To (Seller): ${tx.Destination}`, 'cyan');
        log(`  Amount: ${parseInt(tx.Amount) / 1000000} XRP`, 'cyan');
        log(`  Sequence: ${tx.Sequence}`, 'green');
        log(`  FinishAfter: ${tx.FinishAfter} (${new Date(tx.FinishAfter * 1000).toLocaleString()})`, 'cyan');
        log(`  CancelAfter: ${tx.CancelAfter} (${new Date(tx.CancelAfter * 1000).toLocaleString()})`, 'cyan');
        
        log(`\n📝 To finish this escrow, you need:`, 'yellow');
        log(`  Owner Address: ${tx.Account}`, 'green');
        log(`  Offer Sequence: ${tx.Sequence}`, 'green');
      }
      
      if (tx.TransactionType === 'EscrowFinish') {
        log(`\nEscrow Finish Details:`, 'bright');
        log(`  Finisher: ${tx.Account}`, 'cyan');
        log(`  Owner: ${tx.Owner}`, 'cyan');
        log(`  Sequence: ${tx.OfferSequence}`, 'cyan');
      }
      
      if (meta?.TransactionResult !== 'tesSUCCESS') {
        log(`\n❌ Transaction Failed!`, 'red');
        log(`Error Code: ${meta?.TransactionResult}`, 'red');
        
        // Common error explanations
        const errors = {
          'tecNO_DST_INSUF_XRP': 'Destination account not activated (needs 10 XRP)',
          'tecUNFUNDED_ESCROW': 'Insufficient XRP balance in source account',
          'tecNO_TARGET': 'Escrow not found (wrong sequence or already finished)',
          'tefMAX_LEDGER': 'Transaction expired or timing issue',
          'tecNO_PERMISSION': 'No permission to execute this transaction'
        };
        
        if (errors[meta?.TransactionResult]) {
          log(`Explanation: ${errors[meta.TransactionResult]}`, 'yellow');
        }
      }
      
      log(`\nView on Explorer:`, 'cyan');
      log(`https://testnet.xrpl.org/transactions/${txHash}`, 'blue');
      
    } else {
      log(`\n❌ Transaction not found`, 'red');
    }
    
  } catch (error) {
    log(`\n❌ Error checking transaction: ${error.message}`, 'red');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('\n🔍 XRPL Escrow Diagnostic Tool\n', 'bright');
    log('Usage:', 'cyan');
    log('  Check accounts and escrows:', 'cyan');
    log('    node diagnose-escrow.js <buyer-address> [seller-address]', 'yellow');
    log('', 'reset');
    log('  Check specific transaction:', 'cyan');
    log('    node diagnose-escrow.js --tx <transaction-hash>', 'yellow');
    log('', 'reset');
    log('Examples:', 'cyan');
    log('  node diagnose-escrow.js rABC123...', 'yellow');
    log('  node diagnose-escrow.js rABC123... rXYZ789...', 'yellow');
    log('  node diagnose-escrow.js --tx C1EF8E6A5122ADCEC91F7CCD...', 'yellow');
    process.exit(0);
  }

  // Check if it's a transaction hash query
  if (args[0] === '--tx' || args[0] === '-t') {
    if (!args[1]) {
      log('❌ Please provide a transaction hash', 'red');
      process.exit(1);
    }
    await checkTransaction(args[1]);
    return;
  }

  const buyerAddress = args[0];
  const sellerAddress = args[1];

  log('\n🔍 XRPL ESCROW DIAGNOSTIC REPORT', 'bright');
  log(`Time: ${new Date().toLocaleString()}`, 'cyan');
  
  // Check buyer account
  const buyerActive = await checkAccount(buyerAddress, 'Buyer Account');
  
  // Check seller account if provided
  if (sellerAddress) {
    await checkAccount(sellerAddress, 'Seller Account');
  }
  
  // Check for escrows on buyer account
  if (buyerActive) {
    await checkEscrows(buyerAddress);
  }
  
  log(`\n${'='.repeat(60)}`, 'bright');
  log('Diagnostic Complete', 'green');
  log('='.repeat(60), 'bright');
  log('\nNeed help? Check TROUBLESHOOTING_ESCROW.md\n', 'cyan');
}

main().catch((error) => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red');
  process.exit(1);
});
