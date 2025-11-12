import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil, finalize } from 'rxjs/operators';
import { StatsService } from './services/stats.service';
import { ChartModule } from 'primeng/chart';

// ==================== INTERFACES ====================
interface User {
    details: {
        Cdperson: string;
        Codigo: string;
        Ramo: string;
        Fecha: string;
    };
}

interface MedicineAvailability {
    Disponible: {
        Consumido: string;
        Disponible: string;
    };
}

interface Dependent {
    parentesco: string;
    [key: string]: any;
}

interface Authorization {
    [key: string]: any;
}

interface StatCard {
    id: string;
    title: string;
    value: string;
    icon: string;
    colorClass: string;
    trend: string;
    loading: boolean;
    error: boolean;
}

enum StatCardId {
    CONSUMED = 'consumed',
    AVAILABLE = 'available',
    AUTHORIZATIONS = 'authorizations',
    DEPENDENTS = 'dependents'
}

// ==================== COMPONENT ====================
@Component({
    selector: 'app-statswidget',
    standalone: true,
    imports: [CommonModule, ChartModule],
    templateUrl: './statswidget.html',
    styleUrls: ['./statswidget.scss']
})
export class Statswidget implements OnInit, OnDestroy {
    // ==================== PROPERTIES ====================
    private destroy$ = new Subject<void>();
    private readonly STORAGE_KEY = 'user';

    // Data properties
    consumo: MedicineAvailability | null = null;
    dependientes: Dependent[] = [];
    autorizaciones: Authorization[] = [];

    // Chart properties
    chartData: any;
    chartOptions: any;

    // Stats cards
    statsCards: StatCard[] = [
        {
            id: StatCardId.CONSUMED,
            title: 'Monto consumido',
            value: 'RD$ 0.00',
            icon: 'bi bi-prescription2',
            colorClass: 'stat-orange',
            trend: 'Hasta la fecha',
            loading: true,
            error: false
        },
        {
            id: StatCardId.AVAILABLE,
            title: 'Monto disponible',
            value: 'RD$ 0.00',
            icon: 'bi bi-coin',
            colorClass: 'stat-blue',
            trend: 'Saldo restante',
            loading: true,
            error: false
        },
        {
            id: StatCardId.AUTHORIZATIONS,
            title: 'Autorizaciones',
            value: '0',
            icon: 'pi-check-circle',
            colorClass: 'stat-green',
            trend: 'Activas',
            loading: true,
            error: false
        },
        {
            id: StatCardId.DEPENDENTS,
            title: 'Dependientes',
            value: '0',
            icon: 'pi-users',
            colorClass: 'stat-dark',
            trend: 'Núcleo familiar',
            loading: true,
            error: false
        }
    ];

    constructor(private statsService: StatsService) {
        this.initializeChart();
    }

    // ==================== LIFECYCLE HOOKS ====================
    ngOnInit(): void {
        this.loadUserData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ==================== DATA LOADING ====================
    private loadUserData(): void {
        const user = this.getUserFromStorage();

        if (!user) {
            this.handleStorageError();
            return;
        }

        this.loadAllStats(user);
    }

    private getUserFromStorage(): User | null {
        try {
            const storedValue = localStorage.getItem(this.STORAGE_KEY);

            if (!storedValue) {
                console.warn('No se encontró el usuario en localStorage');
                return null;
            }

            return JSON.parse(storedValue) as User;
        } catch (error) {
            console.error('Error al parsear el usuario:', error);
            return null;
        }
    }

    private loadAllStats(user: User): void {
        const { Cdperson, Codigo, Ramo, Fecha } = user.details;

        // Cargar todas las estadísticas en paralelo
        forkJoin({
            medicine: this.statsService.getMedicineAvailabily(Cdperson, Ramo, Fecha).pipe(
                catchError((err) => {
                    console.error('Error al obtener disponibilidad de medicina:', err);
                    return of(null);
                })
            ),
            dependents: this.statsService.getDependents(Codigo).pipe(
                catchError((err) => {
                    console.error('Error al obtener dependientes:', err);
                    return of([]);
                })
            ),
            authorizations: this.statsService.getAuthorizations(Codigo).pipe(
                catchError((err) => {
                    console.error('Error al obtener autorizaciones:', err);
                    return of({ Table: [] });
                })
            )
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (results) => {
                    this.consumo = results.medicine;
                    this.dependientes = Array.isArray(results.dependents) ? results.dependents : [];
                    this.autorizaciones = results.authorizations?.Table || [];

                    this.updateAllCards();
                },
                error: (err) => {
                    console.error('Error al cargar las estadísticas:', err);
                    this.handleLoadingError();
                }
            });
    }

    // ==================== CARD UPDATES ====================
    private updateAllCards(): void {
        this.updateMedicineCards();
        this.updateDependentsCard();
        this.updateAuthorizationsCard();
    }

    private updateMedicineCards(): void {
        const consumedCard = this.getCardById(StatCardId.CONSUMED);
        const availableCard = this.getCardById(StatCardId.AVAILABLE);

        if (!this.consumo?.Disponible) {
            this.setCardError(consumedCard);
            this.setCardError(availableCard);
            return;
        }

        try {
            const consumido = this.parseAmount(this.consumo.Disponible.Consumido);
            const disponible = this.parseAmount(this.consumo.Disponible.Disponible);

            consumedCard.value = `RD$ ${this.formatCurrency(consumido)}`;
            consumedCard.loading = false;
            consumedCard.error = false;

            availableCard.value = `RD$ ${this.formatCurrency(disponible)}`;
            availableCard.loading = false;
            availableCard.error = false;

            this.updateChart(consumido, disponible);
        } catch (error) {
            console.error('Error al procesar datos de medicina:', error);
            this.setCardError(consumedCard);
            this.setCardError(availableCard);
        }
    }

    private updateDependentsCard(): void {
        const card = this.getCardById(StatCardId.DEPENDENTS);

        try {
            const count = this.dependientes.filter((dep) => dep.parentesco !== 'TITULAR').length;
            card.value = count.toString();
            card.loading = false;
            card.error = false;
        } catch (error) {
            console.error('Error al procesar dependientes:', error);
            this.setCardError(card);
        }
    }

    private updateAuthorizationsCard(): void {
        const card = this.getCardById(StatCardId.AUTHORIZATIONS);

        try {
            card.value = this.autorizaciones.length.toString();
            card.loading = false;
            card.error = false;
        } catch (error) {
            console.error('Error al procesar autorizaciones:', error);
            this.setCardError(card);
        }
    }

    // ==================== CHART ====================
    private initializeChart(): void {
        this.chartData = {
            labels: ['Consumido', 'Disponible'],
            datasets: [
                {
                    data: [0, 0],
                    backgroundColor: ['#F89420', '#00AEF0'],
                    hoverBackgroundColor: ['#ffa940', '#33bff5'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }
            ]
        };

        this.chartOptions = {
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
                    position: 'nearest',
                    intersect: false,
                    usePointStyle: true,
                    callbacks: {
                        label: (context: any) => {
                            const label = context.label || '';
                            const value = this.formatCurrency(context.parsed);
                            return `${label}: RD$ ${value}`;
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: true
        };
    }

    private updateChart(consumido: number, disponible: number): void {
        this.chartData = {
            ...this.chartData,
            datasets: [
                {
                    ...this.chartData.datasets[0],
                    data: [consumido, disponible]
                }
            ]
        };
    }

    // ==================== UTILITY METHODS ====================
    private getCardById(id: string): StatCard {
        const card = this.statsCards.find((c) => c.id === id);
        if (!card) {
            throw new Error(`Card with id ${id} not found`);
        }
        return card;
    }

    private setCardError(card: StatCard): void {
        card.loading = false;
        card.error = true;
        card.value = 'N/A';
        card.trend = 'Error al cargar';
    }

    private handleStorageError(): void {
        this.statsCards.forEach((card) => this.setCardError(card));
    }

    private handleLoadingError(): void {
        this.statsCards.forEach((card) => {
            if (card.loading) {
                this.setCardError(card);
            }
        });
    }

    private parseAmount(value: string | number): number {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? 0 : num;
    }

    private formatCurrency(value: number | string): string {
        const num = this.parseAmount(value);
        return num.toLocaleString('es-DO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // ==================== PUBLIC COMPUTED PROPERTIES ====================
    getConsumptionPercentage(): number {
        if (!this.consumo?.Disponible) return 0;

        const consumido = this.parseAmount(this.consumo.Disponible.Consumido);
        const disponible = this.parseAmount(this.consumo.Disponible.Disponible);
        const total = consumido + disponible;

        return total === 0 ? 0 : (consumido / total) * 100;
    }

    trackByCardId(index: number, card: StatCard): string {
        return card.id;
    }
}
