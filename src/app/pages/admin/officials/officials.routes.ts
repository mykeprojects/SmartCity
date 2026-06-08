import { Routes } from '@angular/router';
import { OfficialListComponent } from './list/official-list.component';
import { OfficialCreateComponent } from './create/official-create.component';
import { OfficialUpdateComponent } from './update/official-update.component';
import { OfficialDetailComponent } from './detail/official-detail.component';

export const AdminOfficialRoutes: Routes = [
  { path: 'list', component: OfficialListComponent },
  { path: 'create', component: OfficialCreateComponent },
  { path: 'update/:id', component: OfficialUpdateComponent },
  { path: 'detail/:id', component: OfficialDetailComponent },
];
