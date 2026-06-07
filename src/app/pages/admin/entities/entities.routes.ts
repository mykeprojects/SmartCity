import { Routes } from '@angular/router';
import { EntityListComponent } from './list/entity-list.component';
import { EntityCreateComponent } from './create/entity-create.component';
import { EntityUpdateComponent } from './update/entity-update.component';
import { EntityDetailComponent } from './detail/entity-detail.component';
import { EntityOfficialsComponent } from './officials/entity-officials.component';

export const AdminEntityRoutes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: EntityListComponent },
  { path: 'create', component: EntityCreateComponent },
  { path: 'update/:id', component: EntityUpdateComponent },
  { path: 'detail/:id', component: EntityDetailComponent },
  { path: ':id/officials', component: EntityOfficialsComponent },
];

