import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { LoginRequest } from '../../../Core/Interfaces/Auth/login-request';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { LoginResponse } from '../../../Core/Interfaces/login-response';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
    @Inject(PLATFORM_ID) private readonly _platformId: object,
  ) {
    this.loginForm = this._fb.group({
      userNameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get userNameOrEmail() {
    return this.loginForm.get('userNameOrEmail');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const data: LoginRequest = this.loginForm.value;

    this._authService.login(data).subscribe({
      next: (response: ApplicationResult<LoginResponse>) => {
        this.isSubmitting = false;
        if (isPlatformBrowser(this._platformId)) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.userName);
          localStorage.setItem('roles', JSON.stringify(response.data.roles));
        }
        this._notifications.showSuccess(
          response.message || 'Login successful',
          'Success',
        );

        // Redirect based on user role
        const roles = response.data.roles;
        if (roles.includes('Instructor')) {
          this._router.navigate(['/instructor/dashboard']);
        } else if (roles.includes('Admin')) {
          this._router.navigate(['/admin/dashboard']);
        } else {
          this._router.navigate(['/student/home']);
        }
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
