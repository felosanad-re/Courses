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
import { ForgetPasswordRequest } from '../../../Core/Interfaces/Auth/forget-password-request';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent {
  forgetPasswordForm: FormGroup;
  isSubmitting = false;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
  ) {
    this.forgetPasswordForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgetPasswordForm.get('email');
  }

  onSubmit(): void {
    if (this.forgetPasswordForm.invalid) {
      this.forgetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const data: ForgetPasswordRequest = this.forgetPasswordForm.value;

    this._authService.forgetPassword(data).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.succeeded) {
          this._notifications.showSuccess(
            response.message ||
              'Password reset instructions sent to your email.',
            'Success',
          );
          // Navigate to OTP verification with the email
          this._router.navigate(['/checkOtp'], {
            queryParams: { email: data.email },
          });
        } else {
          this._notifications.showError(
            response.message || 'Failed to process request. Please try again.',
            'Error',
          );
        }
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
