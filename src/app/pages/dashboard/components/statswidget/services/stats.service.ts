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
        const url = `${this.baseUrl}/Provider/Disponibilidad?cdperson=${encodeURIComponent(codigo)}&ramo=${encodeURIComponent(ramo)}&fecha=${encodeURIComponent(fecha)}`;
        return this.http.get<any>(url).pipe(
            catchError((error) => {
                console.error('Error al obtener info del afiliado:', error);
                return of(null);
            })
        );
    }
    getDependents(codigo: string): Observable<any> {
        const url = `${this.baseUrl}/Provider/NucleoFamiliar?cod_emp=${encodeURIComponent(codigo)}`;
        return this.http.get<any>(url).pipe(
            catchError((error) => {
                console.error('Error al obtener dependientes del afiliado:', error);
                return of(null);
            })
        );
    }
    getAuthorizations(codigo: string): Observable<any> {
        const url = `${this.baseUrl}/Provider/consulta_reclamo_app?codemp=${encodeURIComponent(codigo)}`;
        return this.http.get<any>(url).pipe(
            map((response) => {
                if (typeof response === 'string') {
                    return JSON.parse(response);
                }
                return response;
            }),
            tap((parsed) => {}),
            catchError((error) => {
                console.error('Error al obtener autorizaciones:', error);
                return of({ Table: [] });
            })
        );
    }

    getRefunds(codigo: string): Observable<any> {
        const url = `${this.baseUrl}/Provider/Reembolsos_JS?codemp=${encodeURIComponent(codigo)}`;
        return this.http.get<any>(url).pipe(
            map((response) => {
                if (typeof response === 'string') {
                    return JSON.parse(response);
                }
                return response;
            }),
            tap((parsed) => {}),
            catchError((error) => {
                console.error('Error al obtener reembolsos:', error);
                return of({ Table: [] });
            })
        );
    }
}
