import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StatsService {
    private baseUrl = '/api';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    getMedicineAvailabily(codigo: string, ramo: string, fecha: string): Observable<any> {
        const afiliado = localStorage.getItem('user');
        const url = `${this.baseUrl}/Provider/Disponibilidad?cdperson=${encodeURIComponent(codigo)}&ramo=${encodeURIComponent(ramo)}&fecha=${encodeURIComponent(fecha)}`;
        return this.http.get<any>(url).pipe(
            catchError((error) => {
                console.error('Error al obtener info del afiliado:', error);
                return of(null);
            })
        );
    }
}
