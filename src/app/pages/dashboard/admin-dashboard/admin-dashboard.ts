import { Component, NgModule } from '@angular/core';
import { RecentSalesWidget } from '../components/recentsaleswidget';
import { BestSellingWidget } from '../components/bestsellingwidget';
import { RevenueStreamWidget } from '../components/revenuestreamwidget';
import { Statswidget } from '../components/statswidget/statswidget';
import { DashboardModule } from '../dashboard-module';
import { CommonModule } from '@angular/common';
import { CarouselTab } from '../components/carousel-tab/carousel-tab';

@Component({
    selector: 'app-admin-dashboard',
    imports: [Statswidget, CarouselTab, CommonModule],
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
