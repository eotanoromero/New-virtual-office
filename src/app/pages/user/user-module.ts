import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UserRoutingModule } from './user-routing-module';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
    declarations: [],
    imports: [CommonModule, UserRoutingModule, ReactiveFormsModule, FormsModule, SharedModule]
})
export class UserModule {}
