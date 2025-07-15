import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../pages/authentication/AuthService';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): Observable<boolean | UrlTree> {
    // ✅ Subscribe to the state observable instead of making a new HTTP call
    return this.authService.currentUser$.pipe(
      take(1), // Take the first value and complete
      map(user => {
        if (user) {
          return true; // User is logged in, allow access
        }
        // User is not logged in, redirect to login
        return this.router.parseUrl('/authentication/login');
      })
    );
  }
}