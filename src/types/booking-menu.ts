export type BookingMenuItem = {
  id: string;
  label: string;
  href: string;
  description?: string | null;
  active: boolean;
  sortOrder: number;
};
