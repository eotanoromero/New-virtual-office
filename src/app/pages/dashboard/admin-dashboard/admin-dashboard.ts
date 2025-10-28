import { Component } from '@angular/core';
import { StatsWidget } from '../components/statswidget';
import { RecentSalesWidget } from '../components/recentsaleswidget';
import { BestSellingWidget } from '../components/bestsellingwidget';
import { RevenueStreamWidget } from '../components/revenuestreamwidget';

@Component({
    selector: 'app-admin-dashboard',
    imports: [StatsWidget],
    templateUrl: './admin-dashboard.html',
    styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard {
    user: any;

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log(this.user);
    }
}
