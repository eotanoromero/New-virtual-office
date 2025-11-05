import { Component } from '@angular/core';
import { Statswidget } from '../components/statswidget/statswidget';
import { RecentSalesWidget } from '../components/recentsaleswidget';
import { BestSellingWidget } from '../components/bestsellingwidget';
import { RevenueStreamWidget } from '../components/revenuestreamwidget';
import { CarouselTab } from '../components/carousel-tab/carousel-tab';

@Component({
    selector: 'app-affiliate-dashboard',
    imports: [Statswidget],
    templateUrl: './affiliate-dashboard.html',
    styleUrl: './affiliate-dashboard.scss'
})
export class AffiliateDashboard {
    user: any;

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }
}
