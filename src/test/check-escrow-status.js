const xrpl = require('xrpl');

async function checkEscrowStatus() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('✅ Connected to XRPL Testnet\n');
    
    // Replace with your actual addresses
    const buyerAddress = 'r66iGAiNwGZc11woxWbkeYDhFXeiFTDyb';
    const sellerAddress = 'rpVh7YjJTokEm5GSAVbSP6JSCVH1XKuDxN';
    const offerSequence = 13843538;
    
    console.log('🔍 Checking escrow status...');
    console.log('Buyer (Owner):', buyerAddress);
    console.log('Seller (Destination):', sellerAddress);
    console.log('Offer Sequence:', offerSequence);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Check buyer's account for escrows
    const escrows = await client.request({
      command: 'account_objects',
      account: buyerAddress,
      type: 'escrow'
    });
    
    console.log(`📋 Found ${escrows.result.account_objects.length} escrow(s) on buyer account:\n`);
    
    if (escrows.result.account_objects.length === 0) {
      console.log('❌ No escrows found. This means either:');
      console.log('   1. The escrow was already finished/cancelled');
      console.log('   2. The escrow creation failed');
      console.log('   3. You\'re checking the wrong account\n');
    } else {
      escrows.result.account_objects.forEach((escrow, index) => {
        console.log(`\n📦 Escrow #${index + 1}:`);
        console.log(JSON.stringify(escrow, null, 2));
        
        const amount = parseInt(escrow.Amount) / 1000000;
        const now = Math.floor(Date.now() / 1000);
        const finishAfter = escrow.FinishAfter ? parseInt(escrow.FinishAfter) + 946684800 : null;
        const cancelAfter = escrow.CancelAfter ? parseInt(escrow.CancelAfter) + 946684800 : null;
        
        console.log('\n📊 Escrow Details:');
        console.log(`   Amount: ${amount} XRP`);
        console.log(`   Destination: ${escrow.Destination}`);
        console.log(`   Sequence: ${escrow.Sequence || escrow.PreviousTxnLgrSeq}`);
        
        if (finishAfter) {
          const canFinishIn = finishAfter - now;
          console.log(`   FinishAfter: ${new Date(finishAfter * 1000).toLocaleString()}`);
          console.log(`   Can finish: ${canFinishIn <= 0 ? '✅ YES (now)' : `❌ NO (wait ${canFinishIn}s)`}`);
        }
        
        if (cancelAfter) {
          console.log(`   CancelAfter: ${new Date(cancelAfter * 1000).toLocaleString()}`);
        }
        
        console.log('\n' + '-'.repeat(60));
      });
    }
    
    // Check buyer balance
    const buyerInfo = await client.request({
      command: 'account_info',
      account: buyerAddress
    });
    const buyerBalance = parseInt(buyerInfo.result.account_data.Balance) / 1000000;
    console.log(`\n💰 Buyer Balance: ${buyerBalance} XRP`);
    
    // Check seller balance
    const sellerInfo = await client.request({
      command: 'account_info',
      account: sellerAddress
    });
    const sellerBalance = parseInt(sellerInfo.result.account_data.Balance) / 1000000;
    console.log(`💰 Seller Balance: ${sellerBalance} XRP`);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 NEXT STEPS:');
    console.log('1. If escrows exist and FinishAfter time has passed, try finishing again');
    console.log('2. If no escrows found but transaction shows on explorer, check:');
    console.log('   - Transaction result code (should be tesSUCCESS)');
    console.log('   - That it\'s an EscrowCreate transaction type');
    console.log('3. Make sure you\'re using the correct Owner Address and Sequence\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

checkEscrowStatus();
