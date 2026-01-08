import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'purchases.json');

async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readPurchases() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePurchases(purchases: any[]) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(purchases, null, 2));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || 
                  request.headers.get('x-wallet-address');
  
  const purchases = await readPurchases();
  
  if (address) {
    const filtered = purchases.filter((p: any) => p.buyer === address);
    return NextResponse.json(filtered);
  }
  
  return NextResponse.json(purchases);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const purchases = await readPurchases();
    
    const nextId = String((purchases.length > 0 
      ? Math.max(...purchases.map((p: any) => Number(p.id))) : 0) + 1);

    const newPurchase = {
      id: nextId,
      buyer: body.buyer,
      productId: body.productId,
      txHash: body.txHash || null,
      pdfPath: body.pdfPath || null,
      escrowFinished: false,
      createdAt: new Date().toISOString(),
    };

    purchases.push(newPurchase);
    await writePurchases(purchases);
    
    return NextResponse.json(newPurchase, { status: 201 });
  } catch (error: any) {
    console.error('Error creating purchase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing purchase ID' }, { status: 400 });
    }
    
    const purchases = await readPurchases();
    const index = purchases.findIndex((p: any) => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }
    
    purchases[index] = { ...purchases[index], ...body };
    await writePurchases(purchases);
    
    return NextResponse.json(purchases[index]);
  } catch (error: any) {
    console.error('Error updating purchase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
