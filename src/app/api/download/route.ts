import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const PURCHASES_FILE = path.join(process.cwd(), 'data', 'purchases.json');

async function readPurchases() {
  try {
    const data = await fs.readFile(PURCHASES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const purchaseId = searchParams.get('id');
  const wallet = request.headers.get('x-wallet-address');
  
  if (!purchaseId) {
    return NextResponse.json({ error: 'Missing purchase ID' }, { status: 400 });
  }
  
  const purchases = await readPurchases();
  const purchase = purchases.find((p: any) => p.id === purchaseId);
  
  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
  }
  
  // Verify buyer owns this purchase
  if (!wallet || wallet !== purchase.buyer) {
    return NextResponse.json({ error: 'Forbidden - not your purchase' }, { status: 403 });
  }
  
  // Check if escrow is finished
  if (!purchase.escrowFinished) {
    return NextResponse.json(
      { error: 'Escrow not yet completed. Please finish the escrow first.' }, 
      { status: 403 }
    );
  }
  
  if (!purchase.pdfPath) {
    return NextResponse.json({ error: 'No PDF associated with this purchase' }, { status: 404 });
  }
  
  const absolutePath = path.join(process.cwd(), purchase.pdfPath);
  
  try {
    await fs.access(absolutePath);
    const fileBuffer = await fs.readFile(absolutePath);
    const filename = path.basename(absolutePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(fileBuffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: 'PDF file not found on server' }, { status: 404 });
  }
}
