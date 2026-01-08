/**
 * XRPL Escrow Verification Utility
 * 
 * Helps verify escrow exists and can be finished before attempting the transaction
 */

const TESTNET_SERVER = "wss://s.altnet.rippletest.net:51233";
const RIPPLE_EPOCH_OFFSET = 946684800; // Seconds between Unix epoch and Ripple epoch

interface EscrowInfo {
  exists: boolean;
  amount?: string;
  destination?: string;
  finishAfter?: number;
  finishAfterDate?: Date;
  canFinishNow?: boolean;
  correctSequence?: number; // The actual sequence to use in EscrowFinish
  error?: string;
}

/**
 * Verify an escrow exists and get its details
 */
export async function verifyEscrow(
  ownerAddress: string,
  offerSequence: number
): Promise<EscrowInfo> {
  console.log(`🔍 Verifying escrow: Owner=${ownerAddress}, Sequence=${offerSequence}`);
  
  // Dynamically import xrpl
  const xrpl = await import('xrpl');
  const client = new xrpl.Client(TESTNET_SERVER);
  
  try {
    await client.connect();
    console.log("✅ Connected to XRPL testnet");
    
    // Get account objects (escrows) for the owner
    const response = await client.request({
      command: 'account_objects',
      account: ownerAddress,
      type: 'escrow',
    });
    
    console.log(`📦 Found ${response.result.account_objects.length} escrow(s) for this account`);
    
    // Debug: Log all escrows to see what fields they have
    console.log("🔍 Searching for escrow with sequence:", offerSequence);
    response.result.account_objects.forEach((obj: any, index: number) => {
      console.log(`  Escrow #${index + 1}:`, {
        Amount: obj.Amount,
        Destination: obj.Destination,
        PreviousTxnID: obj.PreviousTxnID?.slice(0, 16) + "...",
        PreviousTxnLgrSeq: obj.PreviousTxnLgrSeq,
        LedgerEntryType: obj.LedgerEntryType,
      });
    });
    
    // The OfferSequence must match the Account Sequence from the EscrowCreate transaction
    // We need to fetch each escrow's EscrowCreate transaction and check its Sequence
    let foundEscrow = null;
    let correctSequence = offerSequence;
    
    for (const escrowObj of response.result.account_objects) {
      const previousTxnID = (escrowObj as any).PreviousTxnID;
      
      try {
        console.log(`🔍 Checking escrow with PreviousTxnID: ${previousTxnID?.slice(0, 16)}...`);
        const txResponse = await client.request({
          command: 'tx',
          transaction: previousTxnID,
        });
        
        const txData = txResponse.result as any;
        
        // The Sequence is in tx_json field
        const txSequence = txData.tx_json?.Sequence || txData.Sequence || txData.tx?.Sequence;
        
        console.log(`  → EscrowCreate had Sequence: ${txSequence}`);
        
        if (txSequence === offerSequence) {
          console.log(`  ✅ MATCH! This is the escrow you're looking for!`);
          foundEscrow = escrowObj;
          correctSequence = txSequence;
          break;
        }
      } catch (err: any) {
        console.warn(`  ⚠️  Could not fetch transaction: ${err.message}`);
      }
    }
    
    if (!foundEscrow) {
      console.log("❌ No escrow found with EscrowCreate sequence:", offerSequence);
      console.log("Available escrow sequences:");
      for (const escrowObj of response.result.account_objects) {
        const previousTxnID = (escrowObj as any).PreviousTxnID;
        try {
          const txResponse = await client.request({
            command: 'tx',
            transaction: previousTxnID,
          });
          const txData = txResponse.result as any;
          const seq = txData.tx_json?.Sequence || txData.Sequence;
          console.log(`  - Sequence ${seq}: ${Number((escrowObj as any).Amount) / 1_000_000} XRP`);
        } catch (err) {
          console.log(`  - Unknown sequence: ${Number((escrowObj as any).Amount) / 1_000_000} XRP`);
        }
      }
      
      return {
        exists: false,
        error: `No escrow found for Owner ${ownerAddress} with Sequence ${offerSequence}. The escrow may have already been finished or cancelled, or the sequence number is incorrect.`,
      };
    }
    
    const escrow = foundEscrow;
    console.log("✅ Escrow found:", escrow);
    
    // Parse the escrow details (type assertion since XRPL types don't include escrow specifics)
    const amount = (escrow as any).Amount;
    const destination = (escrow as any).Destination;
    const finishAfter = (escrow as any).FinishAfter;
    
    console.log(`💰 Amount: ${amount} drops (${Number(amount) / 1_000_000} XRP)`);
    console.log(`📍 Destination: ${destination}`);
    console.log(`✅ Correct OfferSequence to use: ${correctSequence}`);
    
    // Convert Ripple epoch to Unix timestamp for display
    const finishAfterUnix = finishAfter + RIPPLE_EPOCH_OFFSET;
    const finishAfterDate = new Date(finishAfterUnix * 1000);
    const now = Math.floor(Date.now() / 1000);
    const canFinishNow = now >= finishAfterUnix;
    
    console.log(`⏰ FinishAfter: ${finishAfter} (Ripple epoch)`);
    console.log(`📅 FinishAfter Date: ${finishAfterDate.toLocaleString()}`);
    console.log(`✅ Can finish now? ${canFinishNow ? 'YES' : 'NO'}`);
    
    if (!canFinishNow) {
      const secondsRemaining = finishAfterUnix - now;
      const minutesRemaining = Math.ceil(secondsRemaining / 60);
      return {
        exists: true,
        amount,
        destination,
        finishAfter,
        finishAfterDate,
        canFinishNow: false,
        correctSequence,
        error: `Escrow exists but cannot be finished yet. You must wait ${minutesRemaining} more minute(s). The FinishAfter time is ${finishAfterDate.toLocaleString()}.`,
      };
    }
    
    return {
      exists: true,
      amount,
      destination,
      finishAfter,
      finishAfterDate,
      canFinishNow: true,
      correctSequence,
    };
    
  } catch (error: any) {
    console.error("❌ Error verifying escrow:", error);
    return {
      exists: false,
      error: `Failed to verify escrow: ${error.message || 'Unknown error'}`,
    };
  } finally {
    await client.disconnect();
    console.log("🔌 Disconnected from XRPL testnet");
  }
}

/**
 * Get a user-friendly error message from Crossmark response
 */
export function parseCrossmarkError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  const errorCode = error?.code || error?.error_code;
  const errorMessage = error?.message || error?.error_message || error?.error;
  
  // Common error codes from XRPL
  const errorMap: { [key: string]: string } = {
    'tecNO_TARGET': 'Escrow not found. The escrow may have already been finished or cancelled.',
    'tecNO_ENTRY': 'Escrow entry not found on the ledger.',
    'tecUNFUNDED': 'Escrow does not have sufficient funds.',
    'terPRE_SEQ': 'The FinishAfter time has not been reached yet. Please wait and try again.',
    'tefPAST_SEQ': 'The sequence number is in the past.',
    'temBAD_SEQUENCE': 'Invalid sequence number.',
    'tecNO_PERMISSION': 'You do not have permission to finish this escrow.',
  };
  
  if (errorCode && errorMap[errorCode]) {
    return errorMap[errorCode];
  }
  
  if (errorMessage) {
    return errorMessage;
  }
  
  return 'Unknown error occurred';
}
