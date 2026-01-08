/**
 * Debug Escrow Object Fields
 * Shows ALL fields of the escrow to find the correct sequence to use
 */

const xrpl = require('xrpl');

const TESTNET_SERVER = "wss://s.altnet.rippletest.net:51233";
const OWNER = "r66iGAiNwGZc11woxWbkeYDhFXeiFTDyb";

async function debugEscrowFields() {
  console.log("🔍 Debugging escrow object fields...\n");
  
  const client = new xrpl.Client(TESTNET_SERVER);
  
  try {
    await client.connect();
    console.log("✅ Connected to XRPL testnet\n");
    
    const response = await client.request({
      command: 'account_objects',
      account: OWNER,
      type: 'escrow',
    });
    
    console.log(`📦 Found ${response.result.account_objects.length} escrow(s)\n`);
    
    response.result.account_objects.forEach((escrow, index) => {
      console.log(`${"=".repeat(60)}`);
      console.log(`ESCROW #${index + 1}:`);
      console.log(`${"=".repeat(60)}`);
      console.log(JSON.stringify(escrow, null, 2));
      console.log("\n");
    });
    
    // Focus on escrow #2 (the 9.99 XRP one)
    if (response.result.account_objects.length >= 2) {
      const targetEscrow = response.result.account_objects[1];
      console.log("\n" + "🎯".repeat(30));
      console.log("TARGET ESCROW (9.99 XRP) KEY FIELDS:");
      console.log("🎯".repeat(30));
      console.log("Amount:", targetEscrow.Amount);
      console.log("Destination:", targetEscrow.Destination);
      console.log("PreviousTxnLgrSeq:", targetEscrow.PreviousTxnLgrSeq);
      console.log("PreviousTxnID:", targetEscrow.PreviousTxnID);
      
      // These are the fields we can use for OfferSequence
      console.log("\n⚠️  IMPORTANT - Which field to use for OfferSequence?");
      console.log("Option 1 - PreviousTxnLgrSeq:", targetEscrow.PreviousTxnLgrSeq);
      
      // Check if there's a Sequence field
      if (targetEscrow.Sequence) {
        console.log("Option 2 - Sequence:", targetEscrow.Sequence);
      }
      
      // Check for OwnerNode
      if (targetEscrow.OwnerNode) {
        console.log("OwnerNode:", targetEscrow.OwnerNode);
      }
      
      // The correct one is usually in the escrow's index
      console.log("\n💡 The OfferSequence for EscrowFinish should be the");
      console.log("   ACCOUNT SEQUENCE from the EscrowCreate transaction.");
      console.log("   Let's check the original EscrowCreate transaction...\n");
    }
    
    // Now get the EscrowCreate transaction details
    console.log("📋 Fetching original EscrowCreate transaction...\n");
    const txHash = "7AF281879F253FD3EAE606F4BE0D51AA585315C7B07B64E9E229CAF85F183BB7";
    
    const txResponse = await client.request({
      command: 'tx',
      transaction: txHash,
    });
    
    console.log("EscrowCreate Transaction Details:");
    console.log("- Account:", txResponse.result.Account);
    console.log("- Sequence:", txResponse.result.Sequence);
    console.log("- TransactionType:", txResponse.result.TransactionType);
    console.log("- Amount:", txResponse.result.Amount);
    console.log("- Destination:", txResponse.result.Destination);
    
    console.log("\n✅ THE CORRECT OfferSequence TO USE:");
    console.log(`   ${txResponse.result.Sequence}`);
    console.log("\n   ^^^ THIS is the number to use in EscrowFinish! ^^^");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    await client.disconnect();
    console.log("\n🔌 Disconnected");
  }
}

debugEscrowFields().catch(console.error);
