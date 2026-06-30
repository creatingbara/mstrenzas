export type GalleryItem = {
  id: string;
  title?: string;
  category: string;
  imageUrl?: string;
  instagramUrl?: string | null;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
};
