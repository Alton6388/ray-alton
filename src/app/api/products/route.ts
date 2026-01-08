import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readProducts() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeProducts(products: any[]) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
}

export async function GET() {
  const products = await readProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const products = await readProducts();
    
    const nextId = String((products.length > 0 
      ? Math.max(...products.map((p: any) => Number(p.id))) : 0) + 1);

    const newProduct = {
      id: nextId,
      title: body.title || 'Untitled',
      author: body.author || '',
      genre: body.genre || 'Other',
      price: Number(body.price) || 0,
      coverImageUrl: body.coverImageUrl || '',
      seller: body.seller || null,
      pdfPath: body.pdfPath || null,
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);
    await writeProducts(products);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
