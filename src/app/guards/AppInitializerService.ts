// app-initializer.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from '../pages/authentication/AuthService';


@Injectable({ providedIn: 'root' })
export class AppInitializerService {
  constructor(private authService: AuthService) {}

  init(): Promise<void> {
    return new Promise((resolve) => {
      this.authService.checkSession().subscribe(() => resolve());
    });
  }
}
