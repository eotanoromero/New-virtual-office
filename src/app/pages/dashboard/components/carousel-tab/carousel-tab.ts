import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

interface CardData {
    id: number;
    title: string;
    description: string;
    value: string;
    icon: string;
    color: string;
}
@Component({
    selector: 'app-carousel-tab',
    standalone: false,
    templateUrl: './carousel-tab.html',
    styleUrl: './carousel-tab.scss'
})
export class CarouselTab {
    cards: CardData[] = [];
    activeIndex: number = 0;

    responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    ngOnInit() {
        this.cards = [
            {
                id: 1,
                title: 'Tus consumos',
                description: 'Consumos totales',
                value: '$152',
                icon: 'pi pi-shopping-cart',
                color: '#00AEF0'
            },
            {
                id: 2,
                title: 'Revenue',
                description: 'Ingresos totales',
                value: '$2,100',
                icon: 'pi pi-dollar',
                color: '#F89420'
            },
            {
                id: 3,
                title: 'Customers',
                description: 'Clientes activos',
                value: '28,441',
                icon: 'pi pi-users',
                color: '#00AEF0'
            },
            {
                id: 4,
                title: 'Comments',
                description: 'Comentarios sin leer',
                value: '152',
                icon: 'pi pi-comments',
                color: '#264E72'
            },
            {
                id: 5,
                title: 'Autorizaciones',
                description: 'Pendientes',
                value: '45',
                icon: 'pi pi-check-circle',
                color: '#F89420'
            }
        ];
    }

    onPageChange(event: any) {
        this.activeIndex = event.page;
    }
}
