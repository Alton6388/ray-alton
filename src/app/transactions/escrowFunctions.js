import { Client, Wallet, EscrowCreate, EscrowFinish } from 'xrpl'
import { getXrplClient } from './xrpl-client'

// Initialize client
const client = getXrplClient();

export const createEscrow = async (senderSeed, recipientAddress, amount, condition) => {
  try {
    await client.connect();
    
    const senderWallet = Wallet.fromSeed(senderSeed);
    
    const escrowTransaction = {
      TransactionType: 'EscrowCreate',
      Account: senderWallet.address,
      Destination: recipientAddress,
      Amount: amount,
      Condition: condition,
    };

    const prepared = await client.autofill(escrowTransaction);
    const signed = senderWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    await client.disconnect();
    return result;
  } catch (error) {
    await client.disconnect();
    throw error;
  }
};

export const finishEscrow = async (senderSeed, escrowSequence, fulfillment) => {
  try {
    await client.connect();
    
    const senderWallet = Wallet.fromSeed(senderSeed);
    
    const finishTransaction = {
      TransactionType: 'EscrowFinish',
      Account: senderWallet.address,
      OfferSequence: escrowSequence,
      Fulfillment: fulfillment,
    };

    const prepared = await client.autofill(finishTransaction);
    const signed = senderWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    await client.disconnect();
    return result;
  } catch (error) {
    await client.disconnect();
    throw error;
  }
};
console.log('Escrow created:', result.result.meta.deliveredAmount)

const escrowSequence = Number(result.result.meta.TransactionResult) === 'tesSUCCESS' 
  ? (result as any).result.AccountTransactionIndex?.[0]?.EscrowSequence 
  : null

const recipientWallet: Wallet = Wallet.fromSeed("Fill in")

const finishTransaction: EscrowFinish = {
    TransactionType: 'EscrowFinish',
    Account: recipientWallet.address,
    owner: senderWallet.address,
    offerSeqeuence: escrowSequence,
    Fulfillment: fulfillmentHex
}

const preparedFinish = await client.autofill(finishTx)
const signedFinish = recipientWallet.sign(preparedFinish)
const finishResult = await client.submitAndWait(signedFinish.tx_blob)

await client.disconnect()