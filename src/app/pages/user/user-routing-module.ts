import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { ResetPassword } from './reset-password/reset-password';

const routes: Routes = [
    {
        path: '',
        component: Login
    },

    {
        path: 'register',
        component: Register
    },
    {
        path: 'forgot-password',
        component: ResetPassword
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule {}
