export interface EBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number; // in RLUSD
  coverImageUrl: string;
  seller: string; // XRPL address
}
