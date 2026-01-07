export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  imageUrl?: string;
  rating: number;
  sales: number;
  fileSize?: string;
  fileType?: string;
}
