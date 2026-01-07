// cancelEscrow.js - Called if order cancelled (before CancelAfter)
const { Wallet } = require('xrpl');
const { getXrplClient } = require('./xrpl-client');
require('dotenv').config();

const SENDER_SEED = process.env.XRPL_SENDER_SEED;

async function cancelEscrow(owner, sequence) {
  const client = getXrplClient();
  const wallet = new Wallet(SENDER_SEED);
  await client.connect();

  const tx = await client.autofill({
    TransactionType: 'EscrowCancel',
    Account: wallet.address,
    Owner: owner,
    OfferSequence: sequence
  });

  const signed = wallet.sign(tx);
  const result = await client.submitAndWait(signed.tx_blob);
  await client.disconnect();

  if (result.result.meta.TransactionResult === 'tesSUCCESS') {
    return result.result.tx_json.hash;
  }
  throw new Error(result.result.meta.TransactionResult);
}

module.exports = { cancelEscrow };
