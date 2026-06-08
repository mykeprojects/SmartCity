import { Routes } from '@angular/router';
import { CategoryListComponent } from './list/category-list.component';
import { CategoryCreateComponent } from './create/category-create.component';
import { CategoryUpdateComponent } from './update/category-update.component';

export const AdminCategoryRoutes: Routes = [
  { path: 'list', component: CategoryListComponent },
  { path: 'create', component: CategoryCreateComponent },
  { path: 'update/:id', component: CategoryUpdateComponent },
];
