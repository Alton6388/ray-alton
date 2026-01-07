export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'RLUSD' | 'XRP';
  category: string;
  image: string;
  imageUrl?: string;
  rating: number;
  sales: number;
  seller: string;
  fileSize?: string;
  fileType?: string;
}
