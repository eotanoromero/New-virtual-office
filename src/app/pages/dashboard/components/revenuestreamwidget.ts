import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { CommonModule } from '@angular/common';
import { StatsService } from './statswidget/services/stats.service';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule, CommonModule, CardModule],
    template: `
        <p-card class="mb-8">
            <div class="flex flex-col items-center justify-center mt-2 flex-grow">
                <div class="chart-container">
                    <p-chart type="doughnut" [data]="data" [options]="options"></p-chart>
                </div>
                <div class="text-center mt-4 w-full">
                    <div class="flex justify-around items-center gap-4">
                        <div class="flex flex-col items-center">
                            <span class="text-xs text-gray-600 mb-1">Consumido</span>
                            <span class="text-lg font-semibold" style="color: #F89420">
                                {{ consumido | number: '1.2-2' }}
                            </span>
                            <span class="text-xs text-gray-500"> {{ getConsumptionPercentage() | number: '1.0-0' }}% </span>
                        </div>
                        <div class="flex flex-col items-center">
                            <span class="text-xs text-gray-600 mb-1">Disponible</span>
                            <span class="text-lg font-semibold" style="color: #00AEF0">
                                {{ disponible | number: '1.2-2' }}
                            </span>
                            <span class="text-xs text-gray-500"> {{ getAvailablePercentage() | number: '1.0-0' }}% </span>
                        </div>
                    </div>
                </div>
            </div>
        </p-card>
    `
})
export class RevenueStreamWidget {
    data: any;
    options: any;

    consumido: number = 0;
    disponible: number = 0;
    isLoading = true;

    constructor(private statsService: StatsService) {}

    ngOnInit(): void {
        const storedValue = localStorage.getItem('user');
        if (!storedValue) {
            console.warn('No se encontró el usuario en localStorage');
            this.isLoading = false;
            return;
        }

        try {
            const user = JSON.parse(storedValue);
            const codigo = user.details.Cdperson;
            const ramo = user.details.Ramo;
            const fecha = user.details.Fecha;

            this.getMedicineAvailabily(codigo, ramo, fecha);
        } catch (error) {
            console.error('Error al parsear el usuario:', error);
            this.isLoading = false;
        }
    }

    getMedicineAvailabily(codigo: string, ramo: string, fecha: string): void {
        this.statsService.getMedicineAvailabily(codigo, ramo, fecha).subscribe({
            next: (data) => {
                if (data?.Disponible) {
                    this.consumido = parseFloat(data.Disponible.Consumido);
                    this.disponible = parseFloat(data.Disponible.Disponible);
                    this.setupChart();
                } else {
                    console.warn('No se encontró información de consumo');
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al obtener datos del endpoint:', err);
                this.isLoading = false;
            }
        });
    }

    setupChart(): void {
        this.data = {
            labels: ['Consumido', 'Disponible'],
            datasets: [
                {
                    data: [this.consumido, this.disponible],
                    backgroundColor: ['#F89420', '#00AEF0'],
                    hoverBackgroundColor: ['#ffa940', '#33bff5'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }
            ]
        };

        this.options = {
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            responsive: true,
            maintainAspectRatio: true
        };
    }

    getConsumptionPercentage(): number {
        const total = this.consumido + this.disponible;
        return total === 0 ? 0 : (this.consumido / total) * 100;
    }

    getAvailablePercentage(): number {
        const total = this.consumido + this.disponible;
        return total === 0 ? 0 : (this.disponible / total) * 100;
    }
}
