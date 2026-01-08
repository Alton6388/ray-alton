import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 500 * 1024 * 1024, // 500MB
  });

  try {
    const [fields, files] = await form.parse(req);

    const file = files.pdfFile?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded under field "pdfFile"' });
    }

    const originalName = file.originalFilename || 'file.pdf';
    const filepath = file.filepath;

    res.status(200).json({
      fields,
      file: { originalName, filepath },
    });
  } catch (err) {
    console.error('Formidable parse error:', err);
    return res.status(500).json({ error: 'Error parsing the files' });
  }
}

