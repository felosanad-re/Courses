import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { OTPRequest } from '../../../Core/Interfaces/Auth/otprequest';

@Component({
  selector: 'app-check-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './check-otp.component.html',
  styleUrl: './check-otp.component.scss',
})
export class CheckOTPComponent {
  otpForm: FormGroup;
  isSubmitting = false;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
  ) {
    // Pre-fill email from query params if available
    const emailFromQuery = _route.snapshot.queryParamMap.get('email') || '';

    this.otpForm = this._fb.group({
      email: [emailFromQuery, [Validators.required, Validators.email]],
      otp: ['', [Validators.required]],
    });
  }

  get email() {
    return this.otpForm.get('email');
  }

  get otp() {
    return this.otpForm.get('otp');
  }

  onSubmit(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const data: OTPRequest = this.otpForm.value;

    this._authService.checkOTP(data).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.succeeded) {
          this._notifications.showSuccess(
            response.message || 'OTP verified successfully.',
            'Success',
          );
          // After OTP verification, navigate to login
          this._router.navigate(['/login'], {
            queryParams: { email: data.email },
          });
        } else {
          this._notifications.showError(
            response.message || 'Invalid OTP. Please try again.',
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
