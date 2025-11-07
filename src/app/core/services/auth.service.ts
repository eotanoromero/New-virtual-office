import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MOCK_USERS } from '../data/mock-users';
import { Profile } from '../../shared/enum/profile.enum';
import { switchMap, tap } from 'rxjs/operators';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private baseUrl = '/api';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}
    /**
     * @param codigo
     */
    getUserInfoByCode(codigo: string): Observable<any> {
        const url = `${this.baseUrl}/Provider/Asegurado?codigo=${encodeURIComponent(codigo)}`;

        return this.http.get<any>(url).pipe(
            map((response) => response?.Afiliado),
            catchError((error) => {
                console.error('Error al obtener info del afiliado:', error);
                return of(null);
            })
        );
    }

    login(identifier: string, password: string): Observable<boolean> {
        const url = `${this.baseUrl}/Provider/LoginAfiliado?username=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}`;

        return this.http.post<any>(url, {}).pipe(
            map((response) => {
                const asegurado = response?.Asegurado;
                if (!asegurado || !asegurado.token || asegurado.token === 'null') {
                    throw new Error('Credenciales inválidas');
                }
                return asegurado;
            }),
            switchMap((asegurado) => {
                const codigo = asegurado.codigo;
                if (!codigo || codigo === 'null') {
                    throw new Error('Código de afiliado no encontrado tras el login');
                }
                return this.getUserInfoByCode(codigo).pipe(
                    map((afiliadoInfo) => ({
                        asegurado,
                        afiliadoInfo
                    }))
                );
            }),
            tap(({ asegurado, afiliadoInfo }) => {
                if (!afiliadoInfo) {
                    throw new Error('No se pudo obtener la información completa del afiliado.');
                }

                const mockUser = MOCK_USERS.find((u) => u.code === identifier || u.email === identifier);

                const user = mockUser
                    ? mockUser
                    : {
                          code: asegurado.codigo || identifier,
                          message: asegurado.msg || '',
                          name: afiliadoInfo.Nombre || 'Afiliado invitado',
                          role: Profile.AFFILIATE,
                          token: asegurado.token,
                          lastVisit: asegurado.msg?.split('|')[2] || null,
                          details: afiliadoInfo
                      };

                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', asegurado.token);
            }),
            map(() => true),
            catchError((error) => {
                console.error('Error en el proceso de login y fetch de info:', error);
                return of(false);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }

    getUser() {
        return JSON.parse(localStorage.getItem('user') || '{}');
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('user');
    }
}
