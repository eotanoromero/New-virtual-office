import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Mi perfil',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Elianyi Otaño Romero',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Mi perfil',
                                icon: 'pi pi-fw pi-minus',
                                routerLink: ['/auth/login']
                            },
                            {
                                label: 'Actualizar mis datos',
                                icon: 'pi pi-fw pi-minus',
                                routerLink: ['/auth/login']
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Inicio',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'CONSUMOS',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Medicamentos',
                        icon: 'pi pi-fw pi-bars',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Autorizaciones',
                        icon: 'pi pi-fw pi-bars',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Reembolsos',
                        icon: 'pi pi-fw pi-bars',
                        routerLink: ['/pages/crud']
                    }
                ]
            },
            {
                label: 'SOLICITUDES',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Dependientes',
                        icon: 'pi pi-fw pi-id-card',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Proveedores de salud',
                        icon: 'pi pi-fw pi-heart',
                        routerLink: ['/pages/crud']
                    },
                    {
                        label: 'Reembolsos',
                        icon: 'pi pi-fw pi-plus',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Autorizaciones',
                        icon: 'pi pi-fw pi-plus',
                        routerLink: ['/pages/crud']
                    },
                    {
                        label: 'Pagos',
                        icon: 'pi pi-fw pi-credit-card',
                        items: [
                            {
                                label: 'Pagar Poliza',
                                icon: 'pi pi-fw pi-minus',
                                routerLink: ['/landing']
                            },
                            {
                                label: 'Historico de pagos',
                                icon: 'pi pi-fw pi-minus',
                                routerLink: ['/landing']
                            }
                        ]
                    }
                ]
            },

            {
                label: 'Contactanos',
                items: [
                    {
                        label: 'Contacto',
                        icon: 'pi pi-fw pi-headphones',
                        routerLink: ['/documentation']
                    },
                    {
                        label: 'Reporte de errores',
                        icon: 'pi pi-fw pi-wrench',
                        routerLink: ['/documentation']
                    }
                ]
            }
        ];
    }
}
