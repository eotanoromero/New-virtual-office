import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MOCK_USERS } from '../data/mock-users';
import { Profile } from '../../shared/enum/profile.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(private router: Router) {}

    login(identifier: string, password: string): boolean {
        const user = MOCK_USERS.find((u) => u.code === identifier || u.email === identifier);

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            const defaultAffiliate = {
                code: identifier,
                email: identifier.includes('@') ? identifier : `${identifier}@afiliado.com`,
                name: 'Afiliado invitado',
                role: Profile.AFFILIATE
            };
            localStorage.setItem('user', JSON.stringify(defaultAffiliate));
        }

        this.router.navigate(['/dashboard']);
        return true;
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
