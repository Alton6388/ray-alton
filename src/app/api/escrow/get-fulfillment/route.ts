import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Path to fulfillment data (same file as store-fulfillment)
const FULFILLMENT_FILE = path.join(process.cwd(), "fulfillments.json");

interface EscrowFulfillment {
  txHash: string;
  ownerAddress: string;
  offerSequence: number;
  condition: string;
  fulfillmentHex: string;
  createdAt: string;
}

/**
 * Get Escrow Fulfillment
 * GET /api/escrow/get-fulfillment?ownerAddress=...&offerSequence=...
 * 
 * Seller retrieves fulfillmentHex to finish escrow
 */
export async function GET(request: NextRequest) {
  try {
    const ownerAddress = request.nextUrl.searchParams.get("ownerAddress");
    const offerSequence = request.nextUrl.searchParams.get("offerSequence");

    // Validate required fields
    if (!ownerAddress || !offerSequence) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query params: ownerAddress, offerSequence",
        },
        { status: 400 }
      );
    }

    const sequenceNum = parseInt(offerSequence);

    console.log(" Retrieving fulfillment:");
    console.log(`  Owner: ${ownerAddress}`);
    console.log(`  Sequence: ${sequenceNum}`);

    // Read fulfillments from file
    let fulfillments: EscrowFulfillment[] = [];
    try {
      const data = await fs.readFile(FULFILLMENT_FILE, "utf-8");
      fulfillments = JSON.parse(data);
    } catch (err) {
      console.log("  No fulfillments file found yet");
      return NextResponse.json(
        {
          success: false,
          error: "No fulfillments stored yet. The buyer may not have created the escrow yet.",
        },
        { status: 404 }
      );
    }

    // Find matching fulfillment
    const fulfillment = fulfillments.find(
      (f) => f.ownerAddress === ownerAddress && f.offerSequence === sequenceNum
    );

    if (!fulfillment) {
      console.log(" Fulfillment not found");
      return NextResponse.json(
        {
          success: false,
          error: `No fulfillment found for Owner ${ownerAddress} with Sequence ${sequenceNum}. Make sure the buyer created the escrow and the sequence number is correct.`,
        },
        { status: 404 }
      );
    }

    console.log(" Fulfillment found!");
    console.log(`  TX Hash: ${fulfillment.txHash.slice(0, 16)}...`);
    console.log(`  Created: ${fulfillment.createdAt}`);

    return NextResponse.json({
      success: true,
      fulfillment: {
        txHash: fulfillment.txHash,
        condition: fulfillment.condition,
        fulfillmentHex: fulfillment.fulfillmentHex,
        createdAt: fulfillment.createdAt,
      },
    });
  } catch (error: any) {
    console.error(" Error retrieving fulfillment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve fulfillment",
      },
      { status: 500 }
    );
  }
}
