import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { PagesRoutingModule } from './pages-routing-module';
import { ProfileRoutingModule } from './profile/profile-routing-module';

@NgModule({
    declarations: [],
    imports: [CommonModule, PagesRoutingModule, ReactiveFormsModule, ProfileRoutingModule]
})
export class PagesModule {}
