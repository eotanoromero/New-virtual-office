import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { TabsModule } from 'primeng/tabs';

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
    standalone: true,
    imports: [CommonModule, CarouselModule, TabsModule],
    templateUrl: './carousel-tab.html',
    styleUrl: './carousel-tab.scss'
})
export class CarouselTab {
    cards: CardData[] = [];
    cardsReimbursement: CardData[] = [];

    activeIndex: number = 0;
    ngOnInit() {
        this.cards = [
            {
                id: 1,
                title: 'Afiliaciones',
                description: 'Consumos totales',
                value: '$152',
                icon: 'bi bi-card-checklist',
                color: '#00AEF0'
            },
            {
                id: 2,
                title: 'Afiliaciones',
                description: 'Ingresos totales',
                value: '$2,100',
                icon: 'bi bi-card-checklist',
                color: '#00AEF0'
            },
            {
                id: 3,
                title: 'Afiliaciones',
                description: 'Clientes activos',
                value: '28,441',
                icon: 'pi pi-users',
                color: '#00AEF0'
            },
            {
                id: 4,
                title: 'Afiliaciones',
                description: 'Comentarios sin leer',
                value: '152',
                icon: 'bi bi-card-checklist',
                color: '#264E72'
            },
            {
                id: 5,
                title: 'Afiliaciones',
                description: 'Pendientes',
                value: '45',
                icon: 'pi pi-check-circle',
                color: '#F89420'
            }
        ];

        this.cardsReimbursement = [
            {
                id: 1,
                title: 'Afiliaciones',
                description: 'Consumos totales',
                value: '$152',
                icon: 'bi bi-card-checklist',
                color: '#00AEF0'
            },
            {
                id: 2,
                title: 'Afiliaciones',
                description: 'Ingresos totales',
                value: '$2,100',
                icon: 'bi bi-card-checklist',
                color: '#F89420'
            },
            {
                id: 3,
                title: 'Afiliaciones',
                description: 'Clientes activos',
                value: '28,441',
                icon: 'pi pi-users',
                color: '#00AEF0'
            },
            {
                id: 4,
                title: 'Afiliaciones',
                description: 'Comentarios sin leer',
                value: '152',
                icon: 'pi pi-comments',
                color: '#264E72'
            },
            {
                id: 5,
                title: 'Afiliaciones',
                description: 'Pendientes',
                value: '45',
                icon: 'pi pi-check-circle',
                color: '#F89420'
            }
        ];
    }

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

    onPageChange(event: any) {
        this.activeIndex = event.page;
    }
}
