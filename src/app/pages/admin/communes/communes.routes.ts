import { Routes } from '@angular/router';
import { CommuneListComponent } from './list/commune-list.component';
import { CommuneCreateComponent } from './create/commune-create.component';
import { CommuneUpdateComponent } from './update/commune-update.component';

export const AdminCommuneRoutes: Routes = [
  { path: 'list', component: CommuneListComponent },
  { path: 'create', component: CommuneCreateComponent },
  { path: 'update/:id', component: CommuneUpdateComponent },
];
