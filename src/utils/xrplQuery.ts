/**
 * XRPL Transaction Query Utility
 * 
 * Helps retrieve transaction results from the XRPL ledger when Crossmark
 * returns only a UUID instead of full transaction details.
 */

interface TransactionResult {
  hash?: string;
  result?: string;
  validated?: boolean;
  meta?: {
    TransactionResult?: string;
  };
  error?: string;
  error_message?: string;
}

const TESTNET_SERVER = "wss://s.altnet.rippletest.net:51233";

/**
 * Wait for a transaction to be confirmed on the ledger by looking up recent account transactions
 * @param account The account address that submitted the transaction
 * @param maxAttempts Maximum number of attempts (default 20)
 * @param delayMs Delay between attempts in milliseconds (default 1000)
 */
export async function waitForTransactionConfirmation(
  account: string,
  maxAttempts: number = 20,
  delayMs: number = 1000
): Promise<TransactionResult> {
  console.log(`⏳ Waiting for transaction confirmation for account: ${account}`);
  
  // Dynamically import xrpl to avoid server-side rendering issues
  const xrpl = await import('xrpl');
  
  const client = new xrpl.Client(TESTNET_SERVER);
  
  try {
    await client.connect();
    console.log("✅ Connected to XRPL testnet");
    
    // Get the current ledger index to track new transactions
    const ledgerResponse = await client.request({
      command: 'ledger',
      ledger_index: 'validated',
    });
    const startLedgerIndex = ledgerResponse.result.ledger_index;
    console.log(`📍 Starting from ledger index: ${startLedgerIndex}`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔍 Attempt ${attempt}/${maxAttempts} - Checking recent transactions...`);
        
        // Get recent transactions for the account
        const accountTxResponse = await client.request({
          command: 'account_tx',
          account: account,
          ledger_index_min: startLedgerIndex - 5, // Look back a few ledgers
          ledger_index_max: -1, // Up to current
          limit: 10,
        });
        
        console.log(`📦 Found ${accountTxResponse.result.transactions?.length || 0} recent transactions`);
        
        // Look for an EscrowFinish transaction
        const transactions = accountTxResponse.result.transactions || [];
        for (const txWrapper of transactions) {
          const tx = txWrapper.tx;
          const meta = txWrapper.meta;
          
          if (tx && (tx as any).TransactionType === 'EscrowFinish') {
            console.log("✅ Found EscrowFinish transaction:", tx);
            
            // Extract the TransactionResult from meta
            let transactionResult: string | undefined;
            
            if (meta && typeof meta === 'object' && 'TransactionResult' in meta) {
              transactionResult = (meta as any).TransactionResult;
            }
            
            const result: TransactionResult = {
              hash: (tx as any).hash,
              result: transactionResult,
              validated: txWrapper.validated,
              meta: meta && typeof meta === 'object' ? { TransactionResult: transactionResult } : undefined,
            };
            
            console.log("✅ Transaction confirmed:", result);
            return result;
          }
        }
        
        // No EscrowFinish found yet, wait and try again
        console.log(`⏳ No EscrowFinish transaction found yet (attempt ${attempt}/${maxAttempts})`);
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        } else {
          return {
            error: 'txnNotFound',
            error_message: 'EscrowFinish transaction not found after maximum attempts. It may have failed to submit or was rejected.',
          };
        }
        
      } catch (error: any) {
        console.error("❌ Error checking transactions:", error);
        
        if (attempt < maxAttempts) {
          console.log(`⏳ Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        } else {
          return {
            error: error?.data?.error || 'unknown',
            error_message: error?.data?.error_message || error?.message || 'Unknown error checking transactions',
          };
        }
      }
    }
    
    return {
      error: 'timeout',
      error_message: 'Transaction confirmation timed out',
    };
    
  } finally {
    await client.disconnect();
    console.log("🔌 Disconnected from XRPL testnet");
  }
}

/**
 * Check if a string is a valid UUID
 */
export function isUUID(str: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
}

/**
 * Get user-friendly error message for XRPL transaction result codes
 */
export function getTransactionErrorMessage(resultCode: string): string {
  const errorMessages: { [key: string]: string } = {
    // Success
    'tesSUCCESS': 'Transaction successful',
    
    // Escrow-specific errors
    'tecNO_TARGET': 'Escrow not found. Check the Owner Address and Offer Sequence.',
    'tecNO_PERMISSION': 'You do not have permission to finish this escrow.',
    'tecUNFUNDED': 'Escrow does not have sufficient funds.',
    'tecNO_ENTRY': 'Escrow entry not found on the ledger.',
    'tecCRYPTOCONDITION_ERROR': 'Crypto-condition error (if escrow has conditions).',
    
    // Sequence errors
    'tefPAST_SEQ': 'Offer sequence number is in the past.',
    'temBAD_SEQUENCE': 'Invalid offer sequence number.',
    'terPRE_SEQ': 'Escrow cannot be finished yet (FinishAfter time not reached).',
    
    // Fee/balance errors
    'tecINSUFF_FEE': 'Insufficient XRP for transaction fee.',
    'tecINSUFFICIENT_RESERVE': 'Insufficient XRP reserve.',
    'terINSUF_FEE_B': 'Insufficient fee.',
    
    // Transaction not found
    'txnNotFound': 'Transaction not found on the ledger. It may have failed to submit.',
    
    // Other common errors
    'tecDST_TAG_NEEDED': 'Destination tag required.',
    'tecNO_DST': 'Destination account does not exist.',
    'tecNO_DST_INSUF_XRP': 'Destination account has insufficient XRP.',
    'tefFAILURE': 'Transaction failed.',
    'tefBAD_AUTH': 'Bad authorization.',
    'temMALFORMED': 'Malformed transaction.',
  };
  
  return errorMessages[resultCode] || `Transaction failed with code: ${resultCode}`;
}
