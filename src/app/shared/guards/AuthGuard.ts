import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
   const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/user']);
      return false;
    }

    const expiration = JSON.parse(localStorage.getItem('user') || '{}').expiration;
    if (new Date(expiration) < new Date()) {
      localStorage.clear();
      this.router.navigate(['/user']);
      return false;
    }

    return true;
  }
}
