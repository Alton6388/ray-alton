#!/usr/bin/env node

/**
 * Check if an escrow actually exists on the XRPL Testnet
 * Usage: node check-escrow-exists.js <owner-address> <sequence-number>
 */

const xrpl = require('xrpl');

async function checkEscrow() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('❌ Usage: node check-escrow-exists.js <owner-address> <sequence-number>');
    console.log('');
    console.log('Example:');
    console.log('  node check-escrow-exists.js r66iGAiNwGZc11woxWbkeYDhFXeiFTDyb 13843538');
    process.exit(1);
  }

  const ownerAddress = args[0];
  const sequenceNumber = parseInt(args[1]);

  console.log('🔍 Checking escrow on XRPL Testnet...');
  console.log('Owner:', ownerAddress);
  console.log('Sequence:', sequenceNumber);
  console.log('');

  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');

  try {
    console.log('🔌 Connecting to XRPL Testnet...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Get account objects (including escrows)
    console.log('📋 Fetching escrows for account...');
    const accountObjects = await client.request({
      command: 'account_objects',
      account: ownerAddress,
      type: 'escrow',
      ledger_index: 'validated'
    });

    console.log(`\n✅ Found ${accountObjects.result.account_objects.length} escrow(s) for this account:\n`);

    if (accountObjects.result.account_objects.length === 0) {
      console.log('⚠️  No escrows found for this account.');
      console.log('');
      console.log('Possible reasons:');
      console.log('1. The escrow was already finished or cancelled');
      console.log('2. The escrow was never created (transaction failed)');
      console.log('3. Wrong owner address provided');
      console.log('');
      await client.disconnect();
      return;
    }

    // Look for the specific escrow
    const targetEscrow = accountObjects.result.account_objects.find(
      obj => obj.PreviousTxnLgrSeq === sequenceNumber || obj.Sequence === sequenceNumber
    );

    accountObjects.result.account_objects.forEach((escrow, index) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Escrow #${index + 1}:`);
      console.log(`  Destination: ${escrow.Destination}`);
      console.log(`  Amount: ${parseInt(escrow.Amount) / 1000000} XRP`);
      console.log(`  Sequence: ${escrow.PreviousTxnLgrSeq || 'N/A'}`);
      
      if (escrow.FinishAfter) {
        const finishAfter = escrow.FinishAfter + 946684800; // Convert Ripple time to Unix
        const finishDate = new Date(finishAfter * 1000);
        const now = new Date();
        const canFinish = now > finishDate;
        
        console.log(`  FinishAfter: ${finishDate.toLocaleString()}`);
        console.log(`  Can finish now? ${canFinish ? '✅ YES' : '❌ NO (wait ' + Math.ceil((finishDate - now) / 1000) + 's)'}`);
      }
      
      if (escrow.CancelAfter) {
        const cancelAfter = escrow.CancelAfter + 946684800;
        const cancelDate = new Date(cancelAfter * 1000);
        console.log(`  CancelAfter: ${cancelDate.toLocaleString()}`);
      }
      
      console.log(`  Previous Tx: ${escrow.PreviousTxnID}`);
      
      if (targetEscrow && escrow === targetEscrow) {
        console.log(`  🎯 THIS IS YOUR ESCROW (Sequence: ${sequenceNumber})`);
      }
    });

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    if (!targetEscrow) {
      console.log(`⚠️  Could not find escrow with sequence ${sequenceNumber}`);
      console.log('');
      console.log('To finish an escrow, you need:');
      console.log('1. Owner Address: The account that CREATED the escrow');
      console.log('2. Offer Sequence: The sequence number from the EscrowCreate transaction');
      console.log('');
      console.log('💡 Tip: Check the EscrowCreate transaction on testnet.xrpl.org');
      console.log('        Look for the "Sequence" field in the transaction details');
    }

    await client.disconnect();
    console.log('👋 Disconnected from XRPL');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client.isConnected()) {
      await client.disconnect();
    }
    process.exit(1);
  }
}

checkEscrow();
