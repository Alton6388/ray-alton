import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Path to store fulfillment data (JSON file)
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
 * Store Escrow Fulfillment
 * POST /api/escrow/store-fulfillment
 * 
 * Receives fulfillmentHex from buyer after escrow creation
 * Stores it for seller to retrieve later
 */
export async function POST(request: NextRequest) {
  try {
    const { txHash, ownerAddress, offerSequence, condition, fulfillmentHex } = await request.json();

    // Validate required fields
    if (!txHash || !ownerAddress || !offerSequence || !condition || !fulfillmentHex) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: txHash, ownerAddress, offerSequence, condition, fulfillmentHex",
        },
        { status: 400 }
      );
    }

    console.log(" Storing fulfillment for escrow:");
    console.log(`  TX Hash: ${txHash.slice(0, 16)}...`);
    console.log(`  Owner: ${ownerAddress}`);
    console.log(`  Sequence: ${offerSequence}`);

    // Read existing fulfillments
    let fulfillments: EscrowFulfillment[] = [];
    try {
      const data = await fs.readFile(FULFILLMENT_FILE, "utf-8");
      fulfillments = JSON.parse(data);
    } catch (err) {
      // File doesn''t exist yet, start with empty array
      fulfillments = [];
    }

    // Check if this escrow already exists
    const existingIndex = fulfillments.findIndex(
      (f) => f.txHash === txHash && f.ownerAddress === ownerAddress && f.offerSequence === offerSequence
    );

    const newFulfillment: EscrowFulfillment = {
      txHash,
      ownerAddress,
      offerSequence,
      condition,
      fulfillmentHex,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing
      fulfillments[existingIndex] = newFulfillment;
      console.log(" Updated existing fulfillment");
    } else {
      // Add new
      fulfillments.push(newFulfillment);
      console.log(" Stored new fulfillment");
    }

    // Write back to file
    await fs.writeFile(FULFILLMENT_FILE, JSON.stringify(fulfillments, null, 2));

    return NextResponse.json({
      success: true,
      message: "Fulfillment stored successfully",
      stored: {
        txHash: txHash.slice(0, 16) + "...",
        ownerAddress,
        offerSequence,
      },
    });
  } catch (error: any) {
    console.error(" Error storing fulfillment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to store fulfillment",
      },
      { status: 500 }
    );
  }
}
