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
import { AccountRequest } from '../../../Core/Interfaces/Auth/account-request';

@Component({
  selector: 'app-check-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './check-account.component.html',
  styleUrl: './check-account.component.scss',
})
export class CheckAccountComponent {
  checkAccountForm: FormGroup;
  isSubmitting = false;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
  ) {
    this.checkAccountForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.checkAccountForm.get('email');
  }

  onSubmit(): void {
    if (this.checkAccountForm.invalid) {
      this.checkAccountForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const data: AccountRequest = this.checkAccountForm.value;

    this._authService.checkAccount(data).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response.isExist && response.isConfirmed) {
          // Account exists and is confirmed → go to login
          this._notifications.showSuccess(
            'Account is confirmed. You can login now.',
            'Success',
          );
          this._router.navigate(['/login'], {
            queryParams: { email: data.email },
          });
        } else if (response.isExist && !response.isConfirmed) {
          // Account exists but not confirmed → go to confirm account
          this._notifications.showWarning(
            'Account exists but is not confirmed. Please confirm your account.',
            'Warning',
          );
          this._router.navigate(['/confirmAccount'], {
            queryParams: { email: data.email },
          });
        } else {
          // Account does not exist → go to register
          this._notifications.showWarning(
            'Account not found. Please register first.',
            'Warning',
          );
          this._router.navigate(['/register'], {
            queryParams: { email: data.email },
          });
        }
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
