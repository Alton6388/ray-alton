const cc = require('five-bells-condiiton')
const crypto = require('crypto')

const preimageData = crypto.randomBytes(32)
const fulfillment = new cc.PreimageSha256()
fulfillment.setPreimage(preimageData)

const condition = fulfillment.getConditionBinary().toString('hex').toUpperCase()
console.log('Condition:', condition)

const fulfillmentHex = fulfillment.serializeBinary().toString('hex').toUpperCase()
console.log('Fulfillment:', fulfillmentHex)

