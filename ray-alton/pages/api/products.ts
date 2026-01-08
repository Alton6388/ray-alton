import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const dataPath = path.join(process.cwd(), 'data', 'products.json');

function readProducts() {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeProducts(items: any[]) {
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2), 'utf-8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const products = readProducts();
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    const body = req.body;
    const products = readProducts();

    const nextId = String((products.length > 0 ? Math.max(...products.map((p: any) => Number(p.id))) : 0) + 1);

    const newProduct = {
      id: nextId,
      title: body.title || 'Untitled',
      author: body.author || '',
      genre: body.genre || 'Other',
      price: body.price ? Number(body.price) : 0,
      coverImageUrl: body.coverImageUrl || '',
      seller: body.seller || null,
      pdfPath: body.pdfPath || null,
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);
    writeProducts(products);

    return res.status(201).json(newProduct);
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end('Method Not Allowed');
}
