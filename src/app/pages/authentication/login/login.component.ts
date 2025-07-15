// src/app/pages/authentication/login/login.component.ts

import { Component, OnInit } from '@angular/core'; // Import OnInit
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../AuthService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class AppSideLoginComponent { // Implement OnInit
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  
 

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    // ✅ Call the service's login method
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // The service handled the state. Just navigate.
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        this.loading = false;
      },
    });
  }
}
