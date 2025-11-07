import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpdateProfile } from './update-profile/update-profile';
import { Profile } from './profile';

const routes: Routes = [
    { path: 'update-profile', component: UpdateProfile },
    { path: 'dependents', component: Profile }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule {}
