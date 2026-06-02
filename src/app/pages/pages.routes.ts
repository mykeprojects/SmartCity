import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { AuthenticatedGuard } from '../guards/authenticated.guard';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Starter' },
      ],
    },
  },
  {
    path: 'users',
    canActivateChild: [AuthenticatedGuard],
    loadChildren: () => import('./users/users.routes').then((m) => m.UserRoutes)
  }
];
