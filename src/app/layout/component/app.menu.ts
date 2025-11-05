import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { HasRoleDirective } from '@/shared/directive/has-role.directive';
import { Profile } from '@/shared/enum/profile.enum';
import { AvatarGenerator } from '../../shared/helper/avatar_helper';
import { CapitalizePipe } from '@/shared/pipes/capitalize-pipe';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule, HasRoleDirective, CapitalizePipe],
    template: `
        <ul class="layout-menu" *hasRole="[Profile.AFFILIATE]">
             
            <li class="mt-0 mb-0 layout-root-menuitem" [ngClass]="{ 'active-menuitem': isProfileMenuOpen }">
                <div class="card mb-4" style="background-color: #f1f5f9; padding: 1rem; #ffffff: red; cursor: pointer;" (click)="toggleProfileMenu()">
                    <div class="flex align-items-center justify-content-between user-profile">
                        <div class="flex align-items-center">
                            <img [src]="avatarUrl" alt="Avatar del usuario" class="layout-menu me-2" width="36" height="36" />
                            <div>
                                <span class="block font-medium mb-1" style="color:#264E72; font-size:14px">{{ shortUserName }}</span>
                                <span class="block" style="color:#264E72; font-size:13px;">{{ user.details.Tipo | capitalize }}</span>
                            </div>
                        </div>
                        <i [ngClass]="{ 'pi-angle-down': !isProfileMenuOpen, 'pi-angle-up': isProfileMenuOpen }" class="pi pi-fw" style="color: #264E72; margin-left: auto; margin-top:13px"></i>
                    </div>
                </div>

                <ul class="submenu-profile" *ngIf="isProfileMenuOpen">
                    <li app-menuitem [item]="{ label: 'Mi perfil', icon: 'pi pi-fw pi-user', routerLink: ['/my-profile'] }" [index]="-1" [root]="false"></li>
                    <li app-menuitem [item]="{ label: 'Actualizar mis datos', icon: 'pi pi-fw pi-pencil', routerLink: ['/update-profile'] }" [index]="-1" [root]="false"></li>
                </ul>
            </li>
            <li class="menu-separator pt-3"></li>
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>

        <ul class="layout-menu" *hasRole="[Profile.ADMIN]">
            <li class="mt-4 mb-0 layout-root-menuitem" [ngClass]="{ 'active-menuitem': isProfileMenuOpen }">
                <div class="card mb-4" style="background-color: #f1f5f9; padding: 1rem; color: #ffffff; cursor: pointer;" (click)="toggleProfileMenu()">
                    <div class="flex align-items-center justify-content-between user-profile">
                        <div class="flex align-items-center">
                            <img [src]="avatarUrl" alt="Avatar del usuario" class="layout-menu me-2" width="36" height="36" />
                            <div>
                                <span class="block font-medium mb-1" style="color:#264E72; font-size:14px">{{ user.name }}</span>
                                <span class="block" style="color:#264E72; font-size:13px"><b>Código afiliado: </b>{{ user.code }}</span>
                            </div>
                        </div>
                        <i [ngClass]="{ 'pi-angle-down': !isProfileMenuOpen, 'pi-angle-up': isProfileMenuOpen }" class="pi pi-fw" style="color: #264E72; margin-left: auto; margin-top:13px"></i>
                    </div>
                </div>

                <ul class="submenu-profile" *ngIf="isProfileMenuOpen">
                    <li app-menuitem [item]="{ label: 'Mi perfil', icon: 'pi pi-fw pi-user', routerLink: ['/profile/dependents'] }" [index]="-1" [root]="false"></li>
                    <li app-menuitem [item]="{ label: 'Actualizar mis datos', icon: 'pi pi-fw pi-pencil', routerLink: ['/profile/update-profile'] }" [index]="-1" [root]="false"></li>
                </ul>
            </li>
            <li class="menu-separator pt-3"></li>

            <ng-container *ngFor="let item of modelAdmin; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>

        <style>
            .user-profile img {
                width: 40px;
                height: 40px;
                object-fit: cover;
                margin-right: 12px;
                border-radius: 50%;
            }

            .submenu-profile {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .submenu-profile li {
                background-color: #ffffff;
            }

            :host ::ng-deep.layout-menu ul a {
                font-size: 0.9rem;
                text-transform: none;
                color: #264e72;
            }
        </style>
    `
})
export class AppMenu {
    constructor(private router: Router) {}
    Profile = Profile;
    avatarUrl: string = '';
    user: any;
    isProfileMenuOpen: boolean = false;
    model: MenuItem[] = [];
    modelAdmin: MenuItem[] = [];
    shortUserName: string = '';

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('User in menu:', this.user.details.Descripcion);
        const fullName = this.user?.name || 'Desconocido Usuario';
        this.shortUserName = this.getShortName(fullName);
        const initials = this.getInitials(this.shortUserName);
        this.avatarUrl = AvatarGenerator.generateAvatar(initials.firstName, initials.lastName);

        this.model = [
            {
                label: 'Inicio',
                items: [{ label: 'Dashboard', icon: 'pi pi-th-large', routerLink: [''] }]
            },
            {
                label: 'CONSUMOS',
                icon: '',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Medicamentos',
                        icon: 'bi bi-prescription2',
                        routerLink: ['/page/medicine']
                    },
                    {
                        label: 'Autorizaciones',
                        icon: 'bi bi-card-checklist',
                        routerLink: ['/page/authorization']
                    },
                    {
                        label: 'Reembolsos',
                        icon: 'pi pi-receipt',
                        routerLink: ['/page/refund']
                    }
                ]
            },
            {
                label: 'SOLICITUDES',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Dependientes',
                        icon: 'pi pi-users',
                        routerLink: ['/page/dependent']
                    },
                    {
                        label: 'Proveedores de salud',
                        icon: 'bi bi-hospital',
                        routerLink: ['/page/health-provider']
                    },
                    {
                        label: 'Autorizaciones',
                        icon: 'bi bi-card-checklist',
                        routerLink: ['/page/authorizations']
                    },
                    {
                        label: 'Reembolsos',
                        icon: 'pi pi-receipt',
                        routerLink: ['/page/refund']
                    },
                    {
                        label: 'Pagos',
                        icon: 'pi pi-credit-card',
                        items: [
                            {
                                label: 'Pagar Poliza',
                                icon: '',
                                routerLink: ['/page/add-payment']
                            },
                            {
                                label: 'Historico de pagos',
                                icon: '',
                                routerLink: ['/page/payment-history']
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
                        routerLink: ['/page/documentation']
                    },
                    {
                        label: 'Reporte de errores',
                        icon: 'pi pi-fw pi-wrench',
                        routerLink: ['/page/report']
                    }
                ]
            },

            {
                label: '',
                items: [
                    {
                        label: 'Cerrar sesion',
                        icon: 'pi pi-fw pi-arrow-right',
                        command: () => this.logout()
                    }
                ]
            }
        ];

        this.modelAdmin = [
            {
                label: 'Inicio',
                items: [{ label: 'Dashboard', icon: 'pi pi-th-large', routerLink: ['/dashboard'] }]
            },
            {
                label: 'CONSUMOS',
                icon: '',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Medicamentos',
                        icon: 'bi bi-prescription2',
                        routerLink: ['/page/medicine']
                    },
                    {
                        label: 'Autorizaciones',
                        icon: 'bi bi-card-checklist',
                        routerLink: ['/page/authorization']
                    },
                    {
                        label: 'Reembolsos',
                        icon: 'pi pi-receipt',
                        routerLink: ['/page/refund']
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
                        icon: 'pi pi-users',
                        routerLink: ['/page/dependent']
                    },
                    {
                        label: 'Proveedores de salud',
                        icon: 'bi bi-hospital',
                        routerLink: ['/page/health-provider']
                    },
                    {
                        label: 'Autorizaciones',
                        icon: 'bi bi-card-checklist',
                        routerLink: ['/page/authorization']
                    },
                    {
                        label: 'Reembolsos',
                        icon: 'pi pi-receipt',
                        routerLink: ['/page/refund']
                    },
                    {
                        label: 'Pagos',
                        icon: 'pi pi-credit-card',
                        items: [
                            {
                                label: 'Pagar Poliza',
                                icon: '',
                                routerLink: ['/page/add-payment']
                            },
                            {
                                label: 'Historico de pagos',
                                icon: '',
                                routerLink: ['/page/payment-history']
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
                        routerLink: ['/page/contact']
                    },
                    {
                        label: 'Reporte de errores',
                        icon: 'pi pi-fw pi-wrench',
                        routerLink: ['/page/documentation']
                    }
                ]
            },

            {
                label: '',
                items: [
                    {
                        label: 'Cerrar sesion',
                        icon: 'pi pi-fw pi-arrow-right',
                        command: () => this.logout()
                    }
                ]
            }
        ];
    }
    logout() {
        localStorage.removeItem('user');
        this.router.navigate(['/user']);
    }

    toggleProfileMenu() {
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
    }

    /**
     * @param fullName
     * @returns
     */

    private getInitials(fullName: string): { firstName: string; lastName: string } {
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0]?.charAt(0) || 'D';
        const lastName = nameParts[nameParts.length - 1]?.charAt(0) || 'U';
        return { firstName, lastName };
    }

    private getShortName(fullName: string): string {
        if (!fullName) return '';

        const nameParts = fullName.trim().split(/\s+/);

        const firstName = nameParts[0] || '';

        const secondPart = nameParts.length > 1 ? nameParts[1] : '';

        if (firstName && secondPart) {
            return `${firstName} ${secondPart}`;
        }

        return firstName;
    }
}
