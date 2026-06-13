import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { GenerateReport } from './pages/reports/generate-report';
import { NoAuthenticatedGuard } from './guards/no-authenticated.guard';
import { MapLayoutComponent } from './layouts/map-layout/map-layout.component';
import { MapOverviewComponent } from './pages/map/map-overview/map-overview.component';
import { PointComponent } from './pages/point/point.component';
import { ListComponent } from './pages/neighborhood/list/list.component'
import { CreateNeighborhoodComponent } from './pages/neighborhood/create/create-neighborhood.component';
import { UpdateNeighborhoodComponent } from './pages/neighborhood/update/update-neighborhood.component';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        canActivateChild: [AuthenticatedGuard],
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        canActivateChild: [AuthenticatedGuard],
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'ui-components',
        canActivateChild: [AuthenticatedGuard],
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'extra',
        canActivateChild: [AuthenticatedGuard],
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
      {
        path: 'users',
        canActivateChild: [AuthenticatedGuard],
        loadChildren: () =>
          import('./pages/users/users.routes').then((m) => m.UserRoutes),
      },
      {
        path: 'reports',
        canActivateChild: [AuthenticatedGuard],
        children: [
          {
            path: '',
            component: GenerateReport,
          },
        ],
      },
      {
        path: 'map',
        component: MapLayoutComponent,
        children: [
          {
            path: '',
            redirectTo: 'overview',
            pathMatch: 'full',
          },
          {
            path: 'overview',
            component: MapOverviewComponent,
          },
          {
            path: 'point',
            component: PointComponent,
          },
        ],
      },
      {
        path: 'neighborhood',
        component: ListComponent,
      },
      {
        path: 'neighborhood/create',
        component: CreateNeighborhoodComponent,
      },
      {
        path: 'neighborhood/edit/:id',
        component: UpdateNeighborhoodComponent,
      },
      {
        path: 'admin',
        canActivateChild: [AuthenticatedGuard],
        loadChildren: () =>
          import('./pages/admin/admin.routes').then((m) => m.AdminRoutes),
      },
      {
        path: 'account',
        canActivateChild: [AuthenticatedGuard],
        loadChildren: () =>
          import('./pages/account/account.routes').then((m) => m.AccountRoutes),
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        canActivateChild: [NoAuthenticatedGuard],
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];
