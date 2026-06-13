import { Routes } from '@angular/router';
import { AccountProfileComponent } from './profile/account-profile.component';
import { AccountSettingsComponent } from './settings/account-settings.component';

export const AccountRoutes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: AccountProfileComponent },
  { path: 'settings', component: AccountSettingsComponent },
];
