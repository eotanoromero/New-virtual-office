import { AuthGuard } from '@/shared/guards/AuthGuard';
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: '',
        loadChildren: () => import('./app/pages/user/user-module').then((m) => m.UserModule),
        pathMatch: 'prefix'
    },
    {
        path: '',
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
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
                path: 'page',
                loadChildren: () => import('./app/pages/pages-module').then((m) => m.PagesModule)
            },
            {
                path: 'profile',
                loadChildren: () => import('./app/pages/profile/profile-module').then((m) => m.ProfileModule)
            },
            {
                path: '**',
                loadChildren: () => import('./app/pages/pages-module').then((m) => m.PagesModule)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];
