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
    cardsAutorizaciones: CardData[] = [];
    cardsReembolsos: CardData[] = [];
    cardsDependientes: CardData[] = [];

    activeIndex: number = 0;

    ngOnInit() {
        // Cards para Autorizaciones
        this.cardsAutorizaciones = [
            {
                id: 1,
                title: 'Autorizaciones',
                description: 'Consumos totales',
                value: '$152',
                icon: 'bi bi-card-checklist',
                color: '#00AEF0'
            },
            {
                id: 2,
                title: 'Autorizaciones',
                description: 'Ingresos totales',
                value: '$2,100',
                icon: 'bi bi-card-checklist',
                color: '#00AEF0'
            },
            {
                id: 3,
                title: 'Autorizaciones',
                description: 'Clientes activos',
                value: '28,441',
                icon: 'bi bi-card-checklist',
                color: '#00AEF0'
            },
            {
                id: 4,
                title: 'Autorizaciones',
                description: 'Comentarios sin leer',
                value: '152',
                icon: 'bi bi-card-checklist',
                color: '#00AEF0'
            },
            {
                id: 5,
                title: 'Autorizaciones',
                description: 'Pendientes',
                value: '45',
                icon: 'bi bi-card-checklist',
                color: '#00AEF0'
            }
        ];

        // Cards para Reembolsos
        this.cardsReembolsos = [
            {
                id: 1,
                title: 'Reembolsos',
                description: 'Solicitudes totales',
                value: '$3,250',
                icon: 'pi pi-receipt',
                color: '#F89420'
            },
            {
                id: 2,
                title: 'Reembolsos',
                description: 'Aprobados',
                value: '$2,800',
                icon: 'pi pi-receipt',
                color: '#F89420'
            },
            {
                id: 3,
                title: 'Reembolsos',
                description: 'Pendientes',
                value: '$450',
                icon: 'pi pi-receipt',
                color: '#F89420'
            },
            {
                id: 4,
                title: 'Reembolsos',
                description: 'Rechazados',
                value: '12',
                icon: 'pi pi-receipt',
                color: '#F89420'
            }
        ];

        // Cards para Dependientes
        this.cardsDependientes = [
            {
                id: 1,
                title: 'Dependientes',
                description: 'Total registrados',
                value: '156',
                icon: 'pi pi-users',
                color: '#d4d5d7'
            },
            {
                id: 2,
                title: 'Dependientes',
                description: 'Activos',
                value: '142',
                icon: 'pi pi-users',
                color: '#d4d5d7'
            },
            {
                id: 3,
                title: 'Dependientes',
                description: 'Por verificar',
                value: '14',
                icon: 'pi pi-users',
                color: '#d4d5d7'
            },
            {
                id: 4,
                title: 'Dependientes',
                description: 'Menores de edad',
                value: '89',
                icon: 'pi pi-users',
                color: '#d4d5d7'
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
