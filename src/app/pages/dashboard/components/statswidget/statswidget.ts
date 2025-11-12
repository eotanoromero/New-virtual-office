import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from './services/stats.service';
import { ChartModule } from 'primeng/chart';

interface StatCard {
    title: string;
    value: string;
    icon: string;
    colorClass: string;
    trend?: string;
    loading?: boolean;
}

@Component({
    selector: 'app-statswidget',
    standalone: true,
    imports: [CommonModule, ChartModule],
    templateUrl: './statswidget.html',
    styleUrls: ['./statswidget.scss']
})
export class Statswidget implements OnInit {
    consumo: any = null;
    dependientes: any = null;
    autorizaciones: any = null;

    isLoading: boolean = true;

    // Datos y opciones del gráfico doughnut
    data: any;
    options: any;

    statsCards: StatCard[] = [
        {
            title: 'Monto consumido',
            value: '$0.00',
            icon: 'bi bi-prescription2',
            colorClass: 'stat-orange',
            trend: 'Hasta la fecha',
            loading: true
        },
        {
            title: 'Monto disponible',
            value: '$0.00',
            icon: 'bi bi-coin',
            colorClass: 'stat-blue',
            trend: 'Saldo restante',
            loading: true
        },

        {
            title: 'Autorizaciones',
            value: '0',
            icon: 'pi-check-circle',
            colorClass: 'stat-green',
            trend: 'Activos',
            loading: true
        },
        {
            title: 'Dependientes',
            value: '0',
            icon: 'pi-users',
            colorClass: 'stat-dark',
            trend: 'Núcleo familiar',
            loading: true
        }
    ];

    constructor(private statsService: StatsService) {}

    ngOnInit(): void {
        const storedValue = localStorage.getItem('user');

        if (!storedValue) {
            console.warn('No se encontró el usuario en localStorage');
            this.isLoading = false;
            this.updateStatsAsError();
            return;
        }

        try {
            const user = JSON.parse(storedValue);
            const codigo = user.details.Cdperson;
            const code_emp = user.details.Codigo;
            const ramo = user.details.Ramo;
            const fecha = user.details.Fecha;
            this.getMedicineAvailabily(codigo, ramo, fecha);
            this.getDependents(code_emp);
            this.getAuthorizations(code_emp);
        } catch (error) {
            console.error('Error al parsear el usuario:', error);
            this.isLoading = false;
            this.updateStatsAsError();
        }

        this.setupChart(0, 0);
    }

    getMedicineAvailabily(codigo: string, ramo: string, fecha: string): void {
        this.statsService.getMedicineAvailabily(codigo, ramo, fecha).subscribe({
            next: (data) => {
                this.consumo = data;
                this.updateStatsCards();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error en la petición:', err);
                this.isLoading = false;
                this.updateStatsAsError();
            }
        });
    }

    public updateStatsCards(): void {
        if (!this.consumo?.Disponible) return;

        const consumido = parseFloat(this.consumo.Disponible.Consumido);
        const disponible = parseFloat(this.consumo.Disponible.Disponible);

        // Actualizar card de Consumido
        this.statsCards[0].value = `RD$ ${this.formatCurrency(consumido)}`;
        this.statsCards[0].loading = false;

        // Actualizar card de Disponible
        this.statsCards[1].value = `RD$ ${this.formatCurrency(disponible)}`;
        this.statsCards[1].loading = false;

        // Actualizar gráfico
        this.setupChart(consumido, disponible);

        // NO tocar los demás cards aquí - cada uno se actualiza con su propio método
    }

    private setupChart(consumido: number, disponible: number): void {
        const self = this;

        this.data = {
            labels: ['Consumido', 'Disponible'],
            datasets: [
                {
                    data: [consumido, disponible],
                    backgroundColor: ['#F89420', '#00AEF0'],
                    hoverBackgroundColor: ['#ffa940', '#33bff5'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }
            ]
        };

        this.options = {
            cutout: '70%',
            layout: {
                padding: 10
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    external: undefined,
                    position: 'nearest',
                    intersect: false,
                    usePointStyle: true
                }
            },
            responsive: true,
            maintainAspectRatio: true
        };
    }

    private updateStatsAsError(): void {
        this.statsCards.forEach((card) => {
            card.loading = false;
            card.value = 'N/A';
            card.trend = 'Error al cargar';
        });
    }

    private formatCurrency(value: any): string {
        if (!value) return '0.00';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return num.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    getConsumptionPercentage(): number {
        if (!this.consumo?.Disponible) return 0;
        const total = parseFloat(this.consumo.Disponible.Consumido) + parseFloat(this.consumo.Disponible.Disponible);
        if (total === 0) return 0;
        return (parseFloat(this.consumo.Disponible.Consumido) / total) * 100;
    }

    trackByFn(index: number, card: StatCard): string {
        return card.title;
    }
    getDependents(codigo: string): void {
        this.statsService.getDependents(codigo).subscribe({
            next: (data) => {
                this.dependientes = data;
                this.updateDependentsCard();
            },
            error: (err) => {
                console.error('Error al obtener los dependientes:', err);
                this.updateStatsAsError();
            }
        });
    }

    updateDependentsCard(): void {
        if (Array.isArray(this.dependientes)) {
            const cantidadDependientes = this.dependientes.filter((dep) => dep.parentesco !== 'TITULAR').length;

            this.statsCards[3].value = `${cantidadDependientes}`; // Actualiza el valor con el número de dependientes
        } else {
            this.statsCards[3].value = '0'; // Si no hay dependientes o la respuesta es incorrecta
        }
        this.statsCards[3].loading = false; // Termina el estado de carga
    }
    getAuthorizations(codigo: string): void {
        this.statsService.getAuthorizations(codigo).subscribe({
            next: (data) => {
                this.autorizaciones = data.Table;

                this.updateAutorizationsCard();
            },
            error: (err) => {
                console.error('Error al obtener las autorizaciones:', err);
                this.autorizaciones = [];
                this.updateAutorizationsCard();
            }
        });
    }
    updateAutorizationsCard(): void {
        if (Array.isArray(this.autorizaciones)) {
            const cantidadAutorizaciones = this.autorizaciones.length;
            this.statsCards[2].value = `${cantidadAutorizaciones}`; // Autorizaciones -> índice 2
        } else {
            this.statsCards[2].value = '0';
        }
        this.statsCards[2].loading = false;
    }
}
