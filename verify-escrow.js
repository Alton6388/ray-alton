/**
 * Verify Specific Escrow
 * Tests the new verifyEscrow utility with the known escrow
 */

const xrpl = require('xrpl');

const TESTNET_SERVER = "wss://s.altnet.rippletest.net:51233";
const RIPPLE_EPOCH_OFFSET = 946684800;

// Known escrow details
const OWNER = "r66iGAiNwGZc11woxWbkeYDhFXeiFTDyb";
const SEQUENCE = 13853307;

async function verifyEscrow() {
  console.log("🔍 Verifying escrow...\n");
  console.log(`Owner: ${OWNER}`);
  console.log(`Sequence: ${SEQUENCE}\n`);
  
  const client = new xrpl.Client(TESTNET_SERVER);
  
  try {
    await client.connect();
    console.log("✅ Connected to XRPL testnet\n");
    
    // Get all escrows for this account
    const response = await client.request({
      command: 'account_objects',
      account: OWNER,
      type: 'escrow',
    });
    
    console.log(`📦 Found ${response.result.account_objects.length} escrow(s) for this account\n`);
    
    if (response.result.account_objects.length === 0) {
      console.log("❌ No escrows found for this account!");
      console.log("   The escrow may have already been finished or cancelled.\n");
      return;
    }
    
    // Show all escrows
    console.log("📋 All escrows for this account:");
    response.result.account_objects.forEach((escrow, index) => {
      console.log(`\n   Escrow #${index + 1}:`);
      console.log(`   - Amount: ${escrow.Amount} drops (${Number(escrow.Amount) / 1_000_000} XRP)`);
      console.log(`   - Destination: ${escrow.Destination}`);
      console.log(`   - FinishAfter: ${escrow.FinishAfter} (Ripple epoch)`);
      console.log(`   - PreviousTxnLgrSeq: ${escrow.PreviousTxnLgrSeq}`);
      console.log(`   - LedgerEntryType: ${escrow.LedgerEntryType}`);
      
      const finishAfterUnix = escrow.FinishAfter + RIPPLE_EPOCH_OFFSET;
      const finishAfterDate = new Date(finishAfterUnix * 1000);
      const now = Math.floor(Date.now() / 1000);
      const canFinish = now >= finishAfterUnix;
      
      console.log(`   - FinishAfter Date: ${finishAfterDate.toLocaleString()}`);
      console.log(`   - Can finish now? ${canFinish ? '✅ YES' : '❌ NO'}`);
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("🔍 Looking for escrow with sequence:", SEQUENCE);
    
    // Try to find by PreviousTxnLgrSeq
    const found = response.result.account_objects.find(
      escrow => escrow.PreviousTxnLgrSeq === SEQUENCE
    );
    
    if (found) {
      console.log("✅ FOUND! This escrow exists!\n");
      const finishAfterUnix = found.FinishAfter + RIPPLE_EPOCH_OFFSET;
      const now = Math.floor(Date.now() / 1000);
      const canFinish = now >= finishAfterUnix;
      
      if (canFinish) {
        console.log("✅ The escrow CAN be finished now!");
      } else {
        const secondsRemaining = finishAfterUnix - now;
        console.log(`❌ The escrow CANNOT be finished yet.`);
        console.log(`   Wait ${Math.ceil(secondsRemaining / 60)} more minute(s)`);
      }
    } else {
      console.log("❌ NOT FOUND with PreviousTxnLgrSeq =", SEQUENCE);
      console.log("\n⚠️  The sequence number might not match PreviousTxnLgrSeq.");
      console.log("   Try using the 'Sequence' field from the EscrowCreate transaction instead.");
      console.log("   Or the escrow may have already been finished/cancelled.");
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    await client.disconnect();
    console.log("\n🔌 Disconnected from XRPL testnet");
  }
}

verifyEscrow().catch(console.error);
