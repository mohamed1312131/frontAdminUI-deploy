import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';

// Define a type for your user for better type safety
export interface User {
  email: string;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // BehaviorSubject holds the current user state. null means logged out.
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  // Public observable that components can subscribe to.
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {}

  // ✅ New login method that updates the state
  login(credentials: { email: string, password: string }): Observable<User> {
    return this.http.post<User>(
      `${environment.apiUrl}/auth/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap((user) => {
        // On success, update the BehaviorSubject with the user data from the response
        this.currentUserSubject.next(user);
      })
    );
  }

logout() {
    this.http.post(
        `${environment.apiUrl}/auth/logout`, 
        {}, 
        // ✅ Tell HttpClient to expect a plain text response for this call
        { withCredentials: true, responseType: 'text' }
      )
      .subscribe({
        next: () => {
          this.currentUserSubject.next(null); // Clear the state
          this.router.navigate(['/authentication/login']);
        },
        error: (err) => {
          // It's still good practice to handle potential network errors
          console.error('Logout request failed', err);
          this.currentUserSubject.next(null);
          this.router.navigate(['/authentication/login']);
        }
      });
  }

  // ✅ This method is now only for checking the session ONCE on app load
  checkSession(): Observable<any> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(
        tap(user => this.currentUserSubject.next(user)),
        catchError(() => {
          this.currentUserSubject.next(null);
          return of(null); // Return an empty observable on error
        })
      );
  }
  
  // Helper to get the current state value directly
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
}