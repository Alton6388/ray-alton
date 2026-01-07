import {Client, Wallet, EscreowCreate, EscrowFinish} from 'xrpl'
import { getXrplClient } from './xrpl-client'

const Client = getXrplClient()
await Client.connect()

const senderWallet: Wallet = Wallet.fromSeed('Fill in')
const recipientAddress = "Fill in"


const escrowTransaction: EscrowCreate = {
    TransactionType: 'EscrowCreate',
    Account = senderWaller.address,
    Destination: recipientAddress,
    Amount: '1000000',
    Condition: condition,
}

const prepared = await client.autofill(tx)
const signed = senderWallet.sign(prepared)
const result = await client.submitAndWait(signed.transaction_blob)
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