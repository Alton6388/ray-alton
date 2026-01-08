/**
 * Test Transaction Query
 * 
 * This script tests the waitForTransactionConfirmation utility
 * by querying a known transaction (the EscrowCreate from earlier).
 */

const xrpl = require('xrpl');

const TESTNET_SERVER = "wss://s.altnet.rippletest.net:51233";

// The EscrowCreate transaction hash from earlier
const ESCROW_CREATE_HASH = "7AF281879F253FD3EAE606F4BE0D51AA585315C7B07B64E9E229CAF85F183BB7";

async function testTransactionQuery() {
  console.log("🔍 Testing transaction query utility...\n");
  
  const client = new xrpl.Client(TESTNET_SERVER);
  
  try {
    await client.connect();
    console.log("✅ Connected to XRPL testnet\n");
    
    console.log(`📦 Querying transaction: ${ESCROW_CREATE_HASH}\n`);
    
    const txResponse = await client.request({
      command: 'tx',
      transaction: ESCROW_CREATE_HASH,
    });
    
    console.log("📊 Full response:", JSON.stringify(txResponse, null, 2));
    
    if (txResponse.result) {
      const meta = txResponse.result.meta;
      let transactionResult;
      
      if (meta && typeof meta === 'object' && 'TransactionResult' in meta) {
        transactionResult = meta.TransactionResult;
      }
      
      console.log("\n✅ Transaction Details:");
      console.log("  Hash:", txResponse.result.hash);
      console.log("  Result:", transactionResult);
      console.log("  Validated:", txResponse.result.validated);
      console.log("  Ledger Index:", txResponse.result.ledger_index);
      
      // Check if it's an EscrowCreate and show the sequence
      if (txResponse.result.TransactionType === 'EscrowCreate') {
        console.log("  Type: EscrowCreate");
        console.log("  Sequence:", txResponse.result.Sequence);
        console.log("  Amount:", txResponse.result.Amount, "drops");
        console.log("  Destination:", txResponse.result.Destination);
        console.log("  FinishAfter:", txResponse.result.FinishAfter);
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.disconnect();
    console.log("\n🔌 Disconnected from XRPL testnet");
  }
}

testTransactionQuery().catch(console.error);
