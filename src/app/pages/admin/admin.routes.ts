import { Routes } from '@angular/router';
import { AdminEntityRoutes } from './entities/entities.routes';
import { AdminOfficialRoutes } from './officials/officials.routes';
import { AdminCitizenRoutes } from './citizens/citizens.routes';
import { AdminCategoryRoutes } from './categories/categories.routes';
import { AdminCommuneRoutes } from './communes/communes.routes';

export const AdminRoutes: Routes = [
  { path: '', redirectTo: 'entities/list', pathMatch: 'full' },
  { path: 'entities', children: AdminEntityRoutes },
  { path: 'officials', children: AdminOfficialRoutes },
  { path: 'citizens', children: AdminCitizenRoutes },
  { path: 'categories', children: AdminCategoryRoutes },
  { path: 'communes', children: AdminCommuneRoutes },
];
