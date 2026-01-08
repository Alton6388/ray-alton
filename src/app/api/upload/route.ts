import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum 500MB allowed.' }, 
        { status: 400 }
      );
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' }, 
        { status: 400 }
      );
    }
    
    // Create uploads directory if it doesn't exist
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
    
    // Generate unique filename
    const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);
    
    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    
    console.log(`✅ PDF uploaded: ${uniqueName} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    return NextResponse.json({ 
      success: true,
      pdfPath: `uploads/${uniqueName}`,
      filename: uniqueName,
      size: file.size
    });
    
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + error.message }, 
      { status: 500 }
    );
  }
}
