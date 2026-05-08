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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.loginForm.get('email');
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
      next: (response) => {
        this.isSubmitting = false;
        if (isPlatformBrowser(this._platformId)) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.userName);
        }
        this._notifications.showSuccess('Logged in successfully', 'Success');
        this._router.navigate(['/']);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
