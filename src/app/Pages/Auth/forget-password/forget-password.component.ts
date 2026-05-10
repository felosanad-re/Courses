import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { ForgetPasswordRequest } from '../../../Core/Interfaces/Auth/forget-password-request';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent implements OnInit {
  forgetPasswordForm: FormGroup;
  isSubmitting = false;
  token: string | null = null;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
  ) {
    this.forgetPasswordForm = this._fb.nonNullable.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.token = this._activatedRoute.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this._notifications.showError('Invalid reset link. Please try again.', 'Error');
      this._router.navigate(['/forgetPassword']);
    }
  }

  get password() {
    return this.forgetPasswordForm.get('password');
  }

  get confirmPassword() {
    return this.forgetPasswordForm.get('confirmPassword');
  }

  passwordMatchValidator(control: AbstractControl): { mismatch: boolean } | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.forgetPasswordForm.invalid) {
      this.forgetPasswordForm.markAllAsTouched();
      return;
    }

    if (!this.token) {
      this._notifications.showError('Invalid reset link.', 'Error');
      return;
    }

    this.isSubmitting = true;
    const data: ForgetPasswordRequest = {
      token: this.token,
      password: this.forgetPasswordForm.get('password')?.value,
      confirmPassword: this.forgetPasswordForm.get('confirmPassword')?.value,
    };

    this._authService.forgetPassword(data).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this._notifications.showSuccess(
          'Password reset successfully. Please login with your new password.',
          'Success',
        );
        this._router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this._notifications.showError(
          err?.error?.message || 'Failed to reset password. Please try again.',
          'Error',
        );
      },
    });
  }
}
