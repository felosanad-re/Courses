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
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { OTPResponse } from '../../../Core/Interfaces/Auth/otp-response';

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
  userToken!: string;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
  ) {
    this.otpForm = this._fb.group({
      otp: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    this.userToken = this._route.snapshot.queryParamMap.get('token') || '';
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
    const data: OTPRequest = {
      otp: parseInt(this.otpForm.value.otp),
      token: this.userToken,
    };
    this._authService.checkOTP(data).subscribe({
      next: (response: ApplicationResult<OTPResponse>) => {
        this.isSubmitting = false;
        if (response.succeed) {
          this._notifications.showSuccess(
            response.message || 'OTP verified successfully.',
            'Success',
          );
          // After OTP verification, navigate to forget Password
          this._router.navigate(['/forgetPassword'], {
            queryParams: {
              token: response.data.token,
            },
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
