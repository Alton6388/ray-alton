export interface EBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  currency?: 'RLUSD' | 'XRP';
  coverImageUrl: string;
  seller: string | null; // XRPL address
  pdfPath?: string | null;
}
