export interface Category {
  id_category?: number;
  id_parent_category?: number | null;
  name: string;
  description?: string;
  image_url?: string;
  status: string;
}
