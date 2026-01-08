import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

import { promisify } from 'util';
const stat = promisify(fs.stat);

const purchasesPath = path.join(process.cwd(), 'data', 'purchases.json');

function readPurchases() {
  if (!fs.existsSync(purchasesPath)) return [];
  const raw = fs.readFileSync(purchasesPath, 'utf-8');
  try { return JSON.parse(raw); } catch { return []; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const purchaseId = req.query.id as string;
  const wallet = (req.headers['x-wallet-address'] as string) || null;

  if (!purchaseId) return res.status(400).json({ error: 'Missing id' });

  const purchases = readPurchases();
  const purchase = purchases.find((p: any) => p.id === purchaseId);
  if (!purchase) return res.status(404).json({ error: 'Purchase not found' });

  // Simple access control: buyer must match header address
  if (!wallet || wallet !== purchase.buyer) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const pdfPath = purchase.pdfPath;
  if (!pdfPath) return res.status(404).json({ error: 'No file for this purchase' });

  const absolute = path.join(process.cwd(), pdfPath);
  if (!fs.existsSync(absolute)) return res.status(404).json({ error: 'File not found' });

  try {
    const s = await stat(absolute);
    res.setHeader('Content-Length', String(s.size));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(absolute)}"`);

    const stream = fs.createReadStream(absolute);
    stream.pipe(res);
  } catch (err) {
    console.error('Download error', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
