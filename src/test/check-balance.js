const xrpl = require('xrpl');

async function checkBalance(address) {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  
  try {
    await client.connect();
    
    const response = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });
    
    const balance = parseFloat(response.result.account_data.Balance) / 1000000;
    console.log(`Balance for ${address}: ${balance} XRP`);
    
    await client.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

const sellerAddress = 'rpVh7YjJTokEm5GSAVbSP6JSCVH1XKuDxN';
checkBalance(sellerAddress);
