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
                                routerLink: ['/my-profile']
                            },
                            {
                                label: 'Actualizar mis datos',
                                icon: 'pi pi-fw pi-minus',
                                routerLink: ['/update-profile']
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Inicio',
                items: [{ label: 'Dashboard', icon: '', routerLink: ['/'] }]
            },
            {
                label: 'CONSUMOS',
                icon: '',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Medicamentos',
                        icon: '',
                        routerLink: ['/medicine']
                    },
                    {
                        label: 'Autorizaciones',
                        icon: '',
                        routerLink: ['/authorization']
                    },
                    {
                        label: 'Reembolsos',
                        icon: '',
                        routerLink: ['/refund']
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
                        icon: '',
                        routerLink: ['/dependent-affiliate']
                    },
                    {
                        label: 'Proveedores de salud',
                        icon: '',
                        routerLink: ['/health-providers']
                    },
                    {
                        label: 'Reembolsos',
                        icon: '',
                        routerLink: ['/refund']
                    },
                    {
                        label: 'Autorizaciones',
                        icon: '',
                        routerLink: ['/authorizations']
                    },
                    {
                        label: 'Pagos',
                        icon: '',
                        items: [
                            {
                                label: 'Pagar Poliza',
                                icon: '',
                                routerLink: ['/Payment']
                            },
                            {
                                label: 'Historico de pagos',
                                icon: '',
                                routerLink: ['/Payment']
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
            },

            {
                label: '',
                items: [
                    {
                        label: 'Cerrar sesion',
                        icon: 'pi pi-fw pi-arrow-right',
                        routerLink: ['/documentation']
                    }
                ]
            }
        ];
    }
}
