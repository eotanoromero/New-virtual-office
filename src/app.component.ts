import { Component, HostListener, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppLayout } from '@/layout/component/app.layout';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, RouterOutlet, CommonModule, AppLayout],
    template: `<div *ngIf="!isAuthenticated()">
            <router-outlet></router-outlet>
        </div>

        <div *ngIf="isAuthenticated()" class="d-flex">
            <app-layout></app-layout>

            <main class="flex-grow-1 p-3">
                <router-outlet></router-outlet>
            </main>
        </div>`
})
export class AppComponent {
    constructor(private cdRef: ChangeDetectorRef) {}

    ngOnInit() {
        this.cdRef.detectChanges();
    }

    isAuthenticated(): boolean {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.isAuth === true;
    }
}
