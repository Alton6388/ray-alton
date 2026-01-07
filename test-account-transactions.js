/**
 * Test Account Transactions Query
 * 
 * This script tests the new approach of looking up recent transactions
 * by account address instead of transaction hash/UUID.
 */

const xrpl = require('xrpl');

const TESTNET_SERVER = "wss://s.altnet.rippletest.net:51233";

// The buyer account that created the escrow
const BUYER_ADDRESS = "r66iGAiNwGZc11woxWbkeYDhFXeiFTDyb";

async function testAccountTransactions() {
  console.log("🔍 Testing account_tx query...\n");
  
  const client = new xrpl.Client(TESTNET_SERVER);
  
  try {
    await client.connect();
    console.log("✅ Connected to XRPL testnet\n");
    
    // Get current ledger index
    const ledgerResponse = await client.request({
      command: 'ledger',
      ledger_index: 'validated',
    });
    const currentLedger = ledgerResponse.result.ledger_index;
    console.log(`📍 Current ledger index: ${currentLedger}\n`);
    
    // Get recent transactions for the account
    console.log(`📦 Querying recent transactions for: ${BUYER_ADDRESS}\n`);
    
    const accountTxResponse = await client.request({
      command: 'account_tx',
      account: BUYER_ADDRESS,
      ledger_index_min: currentLedger - 100, // Look back 100 ledgers
      ledger_index_max: -1, // Up to current
      limit: 20,
    });
    
    const transactions = accountTxResponse.result.transactions || [];
    console.log(`✅ Found ${transactions.length} recent transactions\n`);
    
    // Display each transaction
    transactions.forEach((txWrapper, index) => {
      const tx = txWrapper.tx;
      const meta = txWrapper.meta;
      
      console.log(`\n--- Transaction ${index + 1} ---`);
      console.log("  Type:", tx.TransactionType);
      console.log("  Hash:", tx.hash);
      console.log("  Ledger:", txWrapper.ledger_index);
      console.log("  Validated:", txWrapper.validated);
      
      if (meta && typeof meta === 'object' && 'TransactionResult' in meta) {
        console.log("  Result:", meta.TransactionResult);
      }
      
      // Show details for EscrowCreate and EscrowFinish
      if (tx.TransactionType === 'EscrowCreate') {
        console.log("  Sequence:", tx.Sequence);
        console.log("  Amount:", tx.Amount, "drops");
        console.log("  Destination:", tx.Destination);
        console.log("  FinishAfter:", tx.FinishAfter);
      } else if (tx.TransactionType === 'EscrowFinish') {
        console.log("  Owner:", tx.Owner);
        console.log("  OfferSequence:", tx.OfferSequence);
      }
    });
    
    // Look for the most recent EscrowFinish
    console.log("\n\n🔍 Looking for most recent EscrowFinish...");
    const escrowFinish = transactions.find(tx => tx.tx.TransactionType === 'EscrowFinish');
    
    if (escrowFinish) {
      console.log("\n✅ Found EscrowFinish transaction!");
      console.log("  Hash:", escrowFinish.tx.hash);
      console.log("  Owner:", escrowFinish.tx.Owner);
      console.log("  OfferSequence:", escrowFinish.tx.OfferSequence);
      
      if (escrowFinish.meta && typeof escrowFinish.meta === 'object' && 'TransactionResult' in escrowFinish.meta) {
        console.log("  Result:", escrowFinish.meta.TransactionResult);
      }
    } else {
      console.log("\n⚠️ No EscrowFinish transaction found in recent history");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.disconnect();
    console.log("\n🔌 Disconnected from XRPL testnet");
  }
}

testAccountTransactions().catch(console.error);
