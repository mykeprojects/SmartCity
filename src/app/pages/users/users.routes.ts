import { Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { UpdateComponent } from './update/update.component';

export const UserRoutes: Routes = [
    {
        path: 'list',
        component: ListComponent
    },
    {
        path: 'create',
        component: CreateComponent
    },
    {
        path: 'update/:id',
        component: UpdateComponent
    }
];
