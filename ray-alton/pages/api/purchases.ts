import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const dataPath = path.join(process.cwd(), 'data', 'purchases.json');

function readPurchases() {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writePurchases(items: any[]) {
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2), 'utf-8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Accept wallet address via header or query
    const address = (req.headers['x-wallet-address'] as string) || (req.query.address as string) || null;
    const purchases = readPurchases();
    if (address) {
      const filtered = purchases.filter((p: any) => p.buyer === address);
      return res.status(200).json(filtered);
    }
    return res.status(200).json(purchases);
  }

  if (req.method === 'POST') {
    const body = req.body;
    const purchases = readPurchases();
    const nextId = String((purchases.length > 0 ? Math.max(...purchases.map((p: any) => Number(p.id))) : 0) + 1);

    const newPurchase = {
      id: nextId,
      buyer: body.buyer,
      productId: body.productId,
      txHash: body.txHash || null,
      pdfPath: body.pdfPath || null,
      createdAt: new Date().toISOString(),
    };

    purchases.push(newPurchase);
    writePurchases(purchases);

    return res.status(201).json(newPurchase);
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end('Method Not Allowed');
}
