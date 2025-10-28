import { Routes } from '@angular/router';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'user',
        pathMatch: 'full'
    },

    {
        path: 'user',
        loadChildren: () => import('./app/pages/user/user-module').then((m) => m.UserModule),
        pathMatch: 'full'
    },

    {
        path: 'dashboard',
        loadChildren: () => import('./app/pages/dashboard/dashboard-module').then((m) => m.DashboardModule)
    },
    {
        path: '**',
        loadChildren: () => import('./app/pages/pages-module').then((m) => m.PagesModule)
    }
];
