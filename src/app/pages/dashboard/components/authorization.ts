// authorization.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { StatsService } from './statswidget/services/stats.service';
import { CapitalizePipe } from '../../../shared/pipes/capitalize-pipe';

@Component({
    standalone: true,
    selector: 'app-authorization',
    imports: [CommonModule, ButtonModule, RippleModule, CapitalizePipe],
    template: `
        <div class="authorization-widget">
            <div class="widget-header">
                <div class="header-left">
                    <i class="pi pi-check-circle"></i>
                    <h3>Autorizaciones Recientes</h3>
                </div>
                <div class="header-right">
                    <button pButton icon="pi pi-chevron-left" class="p-button-text p-button-rounded p-button-sm nav-btn" (click)="prev()" [disabled]="currentIndex === 0"></button>
                    <span class="page-info">{{ currentIndex + 1 }}-{{ Math.min(currentIndex + visibleCards, autorizaciones.length) }} de {{ autorizaciones.length }}</span>
                    <button pButton icon="pi pi-chevron-right" class="p-button-text p-button-rounded p-button-sm nav-btn" (click)="next()" [disabled]="currentIndex >= autorizaciones.length - visibleCards"></button>
                </div>
            </div>

            <div *ngIf="isLoading" class="cards-container">
                <div class="auth-card skeleton" *ngFor="let i of [1, 2]">
                    <div class="skeleton-line header"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                </div>
            </div>

            <div *ngIf="!isLoading && autorizaciones.length > 0" class="cards-wrapper">
                <div class="cards-slider" [style.transform]="'translateX(-' + currentIndex * (100 / visibleCards) + '%)'">
                    <div class="auth-card" *ngFor="let aut of autorizaciones" [style.flex]="'0 0 calc(100% / ' + visibleCards + ' - 0.75rem)'">
                        <div class="card-top">
                            <div class="status-tag">
                                <i class="pi pi-check-circle"></i>
                                <span>Autorizado</span>
                            </div>
                            <span class="auth-number">#{{ aut.AUTORIZACION || 'N/A' }}</span>
                        </div>

                        <div class="card-content">
                            <div class="info-item">
                                <i class="pi pi-calendar icon-calendar"></i>
                                <div class="info-text">
                                    <span class="label">Fecha de apertura</span>
                                    <span class="value">{{ aut.FEC_APE || 'Sin fecha' }}</span>
                                </div>
                            </div>

                            <div class="info-item">
                                <i class="pi pi-file-edit icon-desc"></i>
                                <div class="info-text">
                                    <span class="label">Descripcion</span>
                                    <span class="value">{{ aut.DESCRIPCION | capitalize }}</span>
                                </div>
                            </div>

                            <div class="info-item amount-box">
                                <i class="pi pi-dollar icon-amount"></i>
                                <div class="info-text">
                                    <span class="label">Monto autorizado</span>
                                    <span class="value amount">RD$ {{ formatAmount(aut.MONTO_AUTORIZADO) }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="card-footer">
                            <button pButton label="Ver Detalles" class="p-button-text p-button-sm" (click)="viewDetails(aut)"></button>
                        </div>
                    </div>
                </div>
            </div>

            <div *ngIf="!isLoading && autorizaciones.length === 0" class="empty-box">
                <i class="pi pi-inbox"></i>
                <p>No hay autorizaciones disponibles</p>
            </div>
        </div>
    `,
    styles: [
        `
            .authorization-widget {
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                overflow: hidden;
            }

            // Header compacto
            .widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.25rem;
                border-bottom: 1px solid #f0f0f0;
            }

            .header-left {
                display: flex;
                align-items: center;
                gap: 0.5rem;

                i {
                    font-size: 1.25rem;
                    color: #00aef0;
                }

                h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #264e72;
                    margin: 0;
                }
            }

            .header-right {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .nav-btn {
                width: 2rem;
                height: 2rem;
                color: #264e72;

                &:hover:not(:disabled) {
                    background: rgba(0, 174, 240, 0.08);
                    color: #00aef0;
                }
            }

            .page-info {
                font-size: 0.813rem;
                color: #6b7280;
                font-weight: 500;
                min-width: 60px;
                text-align: center;
            }

            // Cards Container
            .cards-wrapper {
                overflow: hidden;
                padding: 1.25rem;
            }

            .cards-slider {
                display: flex;
                gap: 0.75rem;
                transition: transform 0.4s ease;
            }

            // Auth Card - más liviano
            .auth-card {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                transition: all 0.25s ease;
                min-height: 280px;

                &:hover {
                    border-color: #00aef0;
                    box-shadow: 0 4px 12px rgba(0, 174, 240, 0.12);
                    transform: translateY(-2px);
                }
            }

            // Card Top - versión más suave
            .card-top {
                // background: #264e72;
                border: 1px solid #264e72;
                padding: 0.875rem 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .status-tag {
                display: inline-flex;
                align-items: center;
                gap: 0.375rem;
                background: #264e72;
                padding: 0.25rem 0.625rem;
                border-radius: 12px;
                color: #ffffff;
                font-size: 0.75rem;
                font-weight: 600;

                i {
                    font-size: 0.875rem;
                }
            }

            .auth-number {
                color: #ffffff;
                font-size: 0.75rem;
                font-weight: 600;
            }

            // Card Content
            .card-content {
                padding: 1rem;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.875rem;
            }

            .info-item {
                display: flex;
                gap: 0.75rem;
                align-items: flex-start;
                padding: 0.625rem;
                border-radius: 6px;
                transition: background 0.2s;

                &:hover {
                    background: #f9fafb;
                }

                &.amount-box {
                    background: rgba(248, 148, 32, 0.06);
                    border: 1px solid rgba(248, 148, 32, 0.2);

                    &:hover {
                        background: rgba(248, 148, 32, 0.1);
                    }
                }

                i {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    flex-shrink: 0;
                    margin-top: 0.125rem;
                }

                .icon-calendar {
                    background: rgba(0, 174, 240, 0.1);
                    color: #00aef0;
                }

                .icon-desc {
                    background: rgba(0, 174, 240, 0.1);
                    color: #00aef0;
                }

                .icon-amount {
                    background: rgba(0, 174, 240, 0.1);
                    color: #00aef0;
                }
            }

            .info-text {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.125rem;
                min-width: 0;
            }

            .label {
                font-size: 1.2rem;
                font-weight: 600;
                color: #9ca3af;
                letter-spacing: 0.3px;
            }

            .value {
                font-size: 0.99rem;
                font-weight: 500;
                color: #264e72;
                word-wrap: break-word;
                line-height: 1.4;

                &.amount {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #f89420;
                }
            }

            .card-footer {
                padding: 0.75rem 1rem;
                border-top: 1px solid #f0f0f0;
                background: #fafafa;

                button {
                    width: 100%;
                    justify-content: center;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #00aef0;
                    padding: 0.5rem;

                    &:hover {
                        background: rgba(0, 174, 240, 0.08);
                    }
                }
            }

            // Loading Skeleton
            .cards-container {
                display: flex;
                gap: 0.75rem;
                padding: 1.25rem;
            }

            .skeleton {
                pointer-events: none;
                padding: 1rem;

                .skeleton-line {
                    height: 0.875rem;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 4px;
                    margin-bottom: 0.625rem;

                    &.header {
                        height: 1.25rem;
                        width: 70%;
                        margin-bottom: 1rem;
                    }

                    &.short {
                        width: 60%;
                    }
                }
            }

            @keyframes shimmer {
                0% {
                    background-position: 200% 0;
                }
                100% {
                    background-position: -200% 0;
                }
            }

            // Empty State
            .empty-box {
                text-align: center;
                padding: 3rem 1.5rem;

                i {
                    font-size: 3rem;
                    color: #cbd5e1;
                    margin-bottom: 0.75rem;
                }

                p {
                    font-size: 2rem;
                    color: #6b7280;
                    margin: 0;
                }
            }

            // Responsive
            @media (max-width: 1024px) {
                .header-left h3 {
                    font-size: 1rem;
                }
            }

            @media (max-width: 600px) {
                .widget-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.75rem;
                    padding: 0.875rem 1rem;
                }

                .cards-wrapper,
                .cards-container {
                    padding: 1rem;
                }

                .auth-card {
                    min-height: 260px;
                }

                .value.amount {
                    font-size: 1.125rem;
                }
            }
        `
    ],
    providers: [StatsService]
})
export class Authorization implements OnDestroy, OnInit {
    autorizaciones: any[] = [];
    currentIndex = 0;
    visibleCards = 2;
    isLoading = true;
    Math = Math;

    private resizeHandler = () => this.updateVisibleCards();

    constructor(private statsService: StatsService) {}

    ngOnInit() {
        this.updateVisibleCards();
        window.addEventListener('resize', this.resizeHandler);

        const storedValue = localStorage.getItem('user');
        if (!storedValue) {
            this.isLoading = false;
            return;
        }

        try {
            const user = JSON.parse(storedValue);
            const code_emp = user.details.Codigo;
            this.getAuthorizations(code_emp);
        } catch (error) {
            console.error('Error al parsear el usuario:', error);
            this.isLoading = false;
        }
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.resizeHandler);
    }

    private updateVisibleCards() {
        const w = window.innerWidth;
        if (w < 768) {
            this.visibleCards = 1;
        } else {
            this.visibleCards = 2;
        }

        if (this.currentIndex > Math.max(0, this.autorizaciones.length - this.visibleCards)) {
            this.currentIndex = Math.max(0, this.autorizaciones.length - this.visibleCards);
        }
    }

    getAuthorizations(codigo: string): void {
        this.isLoading = true;
        this.statsService.getAuthorizations(codigo).subscribe({
            next: (data) => {
                this.autorizaciones = data.Table ?? [];
                this.updateVisibleCards();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al obtener las autorizaciones:', err);
                this.autorizaciones = [];
                this.isLoading = false;
            }
        });
    }

    formatAmount(amount: any): string {
        if (!amount) return '0.00';
        const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
        return num.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    viewDetails(authorization: any): void {
        console.log('Ver detalles de:', authorization);
    }

    next() {
        if (this.currentIndex < this.autorizaciones.length - this.visibleCards) {
            this.currentIndex++;
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
    }
}
