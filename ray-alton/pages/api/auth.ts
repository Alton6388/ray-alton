import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const accountsPath = path.join(process.cwd(), 'data', 'accounts.json');
const noncePath = path.join(process.cwd(), 'data', 'nonces.json');

function readAccounts() {
  if (!fs.existsSync(accountsPath)) return [];
  const raw = fs.readFileSync(accountsPath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAccounts(items: any[]) {
  fs.writeFileSync(accountsPath, JSON.stringify(items, null, 2), 'utf-8');
}

function readNonces() {
  if (!fs.existsSync(noncePath)) return {};
  const raw = fs.readFileSync(noncePath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeNonces(items: any) {
  fs.writeFileSync(noncePath, JSON.stringify(items, null, 2), 'utf-8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST' && req.query.action === 'nonce') {
    // POST /api/auth?action=nonce
    // Request body: { address }
    // Response: { nonce }
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required' });

    const nonce = crypto.randomBytes(16).toString('hex');
    const nonces = readNonces();
    nonces[address] = { nonce, createdAt: new Date().toISOString() };
    writeNonces(nonces);

    return res.status(200).json({ nonce });
  }

  if (req.method === 'POST' && req.query.action === 'verify') {
    // POST /api/auth?action=verify
    // Request body: { address, nonce, signature }
    // Response: { account: { id, address, createdAt } }
    // For now, accept nonce without signature verification (dev flow)
    const { address, nonce } = req.body;
    if (!address || !nonce) return res.status(400).json({ error: 'Address and nonce required' });

    const nonces = readNonces();
    if (!nonces[address] || nonces[address].nonce !== nonce) {
      return res.status(401).json({ error: 'Invalid nonce' });
    }

    // Nonce is valid; delete it (single-use)
    delete nonces[address];
    writeNonces(nonces);

    // Find or create account
    const accounts = readAccounts();
    let account = accounts.find((a: any) => a.address === address);
    if (!account) {
      account = {
        id: `acc_${crypto.randomBytes(8).toString('hex')}`,
        address,
        createdAt: new Date().toISOString(),
      };
      accounts.push(account);
      writeAccounts(accounts);
    }

    return res.status(200).json({ account });
  }

  res.setHeader('Allow', 'POST');
  res.status(405).end('Method Not Allowed');
}
