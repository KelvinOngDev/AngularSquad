import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { DataBarang } from './pages/data-barang/data-barang';
import { DokterDashboard } from './pages/dokter-dashboard/dokter-dashboard';
import { Login } from './pages/login/login';
import { Settings } from './pages/settings/settings';
import { UserManagement } from './pages/user-management/user-management';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'data-barang', component: DataBarang, canActivate: [authGuard] },
  { path: 'crud-features', component: DataBarang, canActivate: [authGuard] },
  { path: 'barang', component: DataBarang, canActivate: [authGuard] },
  { path: 'master-detail', pathMatch: 'full', component: DokterDashboard, canActivate: [authGuard] },
  { path: 'master-detail/:id', component: DokterDashboard, canActivate: [authGuard] },
  { path: 'user-management', component: UserManagement, canActivate: [authGuard] },
  { path: 'users', component: UserManagement, canActivate: [authGuard] },
  { path: 'settings', component: Settings, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
