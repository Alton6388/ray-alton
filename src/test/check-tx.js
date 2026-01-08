const xrpl = require('xrpl');

async function checkTx() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  
  try {
    await client.connect();
    
    // Get recent transactions for the buyer
    const response = await client.request({
      command: 'account_tx',
      account: 'r66iGAiNwGZc11woxWbkeYDhFXeiFTDyb',
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: 5
    });
    
    console.log('\n📋 Last 5 transactions:\n');
    response.result.transactions.forEach((tx, i) => {
      const txData = tx.tx;
      const meta = tx.meta;
      console.log(`${i + 1}. ${txData.TransactionType}`);
      console.log(`   Hash: ${txData.hash}`);
      console.log(`   Result: ${meta.TransactionResult}`);
      if (txData.TransactionType === 'EscrowFinish') {
        console.log(`   Owner: ${txData.Owner}`);
        console.log(`   OfferSequence: ${txData.OfferSequence}`);
      }
      console.log('');
    });
    
    await client.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTx();
