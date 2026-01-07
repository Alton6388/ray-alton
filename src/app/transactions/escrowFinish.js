const { Wallet } = require('xrpl');
const { getXrplClient } = require('./xrpl-client');
require('dotenv').config();

const RECEIVER_SEED = process.env.XRPL_RECEIVER_SEED;

async function finishEscrow(owner, sequence, fulfillmentHex) {
  const client = getXrplClient();
  const wallet = new Wallet(RECEIVER_SEED);
  await client.connect();

  const tx = await client.autofill({
    TransactionType: 'EscrowFinish',
    Account: wallet.address,
    Owner: owner,
    OfferSequence: sequence,
    Fulfillment: fulfillmentHex
  });

  const signed = wallet.sign(tx);
  const result = await client.submitAndWait(signed.tx_blob);
  await client.disconnect();

  if (result.result.meta.TransactionResult === 'tesSUCCESS') {
    return result.result.tx_json.hash;
  }
  throw new Error(result.result.meta.TransactionResult);
}

module.exports = { finishEscrow };
