import { Component } from '@angular/core';
import { Profile } from '@/shared/enum/profile.enum';

import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AffiliateDashboard } from './affiliate-dashboard/affiliate-dashboard';
import { HasRoleDirective } from '../../shared/directive/has-role.directive';
import { AppLayout } from '@/layout/component/app.layout';

@Component({
    selector: 'app-dashboard',
    imports: [AppLayout],
    template: ` <app-layout> </app-layout> `
})
export class Dashboard {}
