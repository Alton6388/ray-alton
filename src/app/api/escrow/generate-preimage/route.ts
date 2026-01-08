import { NextRequest, NextResponse } from "next/server";

/**
 * Generate Preimage SHA256 for EscrowCreate
 * POST /api/escrow/generate-preimage
 * 
 * Returns { condition, fulfillmentHex }
 */
export async function POST(request: NextRequest) {
  try {
    const crypto = require("crypto");
    const cc = require("five-bells-condition");

    // Generate random 32-byte preimage
    const preimageData = crypto.randomBytes(32);
    const fulfillment = new cc.PreimageSha256();
    fulfillment.setPreimage(preimageData);

    const condition = fulfillment.getConditionBinary().toString("hex").toUpperCase();
    const fulfillmentHex = fulfillment.serializeBinary().toString("hex").toUpperCase();

    console.log(" Generated preimage:");
    console.log(`  Condition: ${condition.slice(0, 20)}...`);
    console.log(`  Fulfillment: ${fulfillmentHex.slice(0, 20)}...`);

    return NextResponse.json({
      success: true,
      condition,
      fulfillmentHex,
    });
  } catch (error: any) {
    console.error(" Error generating preimage:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate preimage",
      },
      { status: 500 }
    );
  }
}
