import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { RegisterRequest } from '../../../Core/Interfaces/Auth/register-request';
import { Application } from 'express';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { RegisterResponse } from '../../../Core/Interfaces/Auth/register-response';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
  ) {
    this.registerForm = this._fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        userName: ['', [Validators.required]],
        address: ['', [Validators.required, Validators.minLength(5)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get userName() {
    return this.registerForm.get('userName');
  }

  get address() {
    return this.registerForm.get('address');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  /** Custom validator: password and confirmPassword must match */
  private passwordMatchValidator(
    form: FormGroup,
  ): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const data: RegisterRequest = this.registerForm.value;

    this._authService.register(data).subscribe({
      next: (response: ApplicationResult<RegisterResponse>) => {
        this.isSubmitting = false;
        this._notifications.showSuccess(
          response.message ||
            'Registration successful. Please confirm your account.',
          'Success',
        );
        this._router.navigate(['/login'], {
          queryParams: { email: data.email, registered: true },
        });
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
