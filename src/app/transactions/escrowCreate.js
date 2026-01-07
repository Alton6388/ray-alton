const crypto = require('crypto');
const cc = require('five-bells-condition');
const { Wallet, xrpToDrops } = require('xrpl');
const { getXrplClient } = require('./xrpl-client');
require('dotenv').config();

const SENDER_SEED = process.env.XRPL_SENDER_SEED;

function generatePreimageSha256() {
  const preimageData = crypto.randomBytes(32);
  const fulfillment = new cc.PreimageSha256();
  fulfillment.setPreimage(preimageData);
  return {
    condition: fulfillment.getConditionBinary().toString('hex').toUpperCase(),
    fulfillmentHex: fulfillment.serializeBinary().toString('hex').toUpperCase()
  };
}

async function createEscrow(destination, amountValue, cancelAfterDays = 7, isRLUSD = true) {
  const client = getXrplClient();
  const wallet = new Wallet(SENDER_SEED);
  await client.connect();

  const { condition, fulfillmentHex } = generatePreimageSha256();
  const cancelAfter = Math.floor(Date.now() / 1000) + (cancelAfterDays * 86400);

  const amount = isRLUSD 
    ? { currency: 'XLS:15:8D3DC3B8DDAE7D1C6639118D89957EC1CFEE795C7D1B', value: amountValue.toString(), issuer: 'rLsREnvy59zduBugz9Vzz8UShpNU4kj11D' }
    : xrpToDrops(amountValue);

  const tx = await client.autofill({
    TransactionType: 'EscrowCreate',
    Account: wallet.address,
    Amount: amount,
    Destination,
    Condition: condition,
    CancelAfter: cancelAfter
  });

  const signed = wallet.sign(tx);
  const result = await client.submitAndWait(signed.tx_blob);
  await client.disconnect();

  if (result.result.meta.TransactionResult === 'tesSUCCESS') {
    return {
      owner: wallet.address,
      sequence: parseInt(result.result.tx_json.Sequence),
      fulfillmentHex, 
      condition,
      amount: amountValue + (isRLUSD ? ' RLUSD' : ' XRP')
    };
  }
  throw new Error(result.result.meta.TransactionResult);
}

module.exports = { createEscrow };
