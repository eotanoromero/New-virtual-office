import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AffiliateDashboard } from './affiliate-dashboard/affiliate-dashboard';
import { HasRoleDirective } from '@/shared/directive/has-role.directive';
import { Profile } from '@/shared/enum/profile.enum';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, AdminDashboard, AffiliateDashboard, HasRoleDirective],
    template: `
        <app-admin-dashboard *hasRole="[Profile.ADMIN]"></app-admin-dashboard>
        <app-affiliate-dashboard *hasRole="[Profile.AFFILIATE]"></app-affiliate-dashboard>
    `
})
export class Dashboard {
    Profile = Profile;
}
