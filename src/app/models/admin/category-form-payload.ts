import { Category } from '../territorial/category';

export interface CategoryFormPayload {
  category: Partial<Category>;
  imageFile?: File;
}
