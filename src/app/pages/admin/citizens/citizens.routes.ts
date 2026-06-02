import { Routes } from '@angular/router';
import { CitizenListComponent } from './list/citizen-list.component';
import { CitizenCreateComponent } from './create/citizen-create.component';
import { CitizenUpdateComponent } from './update/citizen-update.component';
import { CitizenDetailComponent } from './detail/citizen-detail.component';

export const AdminCitizenRoutes: Routes = [
  { path: 'list', component: CitizenListComponent },
  { path: 'create', component: CitizenCreateComponent },
  { path: 'update/:id', component: CitizenUpdateComponent },
  { path: 'detail/:id', component: CitizenDetailComponent },
];
