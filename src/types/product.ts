export type Product = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  stock?: number | null;
  imageUrl: string;
  active: boolean;
};
