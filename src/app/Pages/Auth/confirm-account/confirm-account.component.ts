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
import { ConfirmRequest } from '../../../Core/Interfaces/Auth/confirm-request';

@Component({
  selector: 'app-confirm-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './confirm-account.component.html',
  styleUrl: './confirm-account.component.scss',
})
export class ConfirmAccountComponent {
  confirmForm: FormGroup;
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

    this.confirmForm = this._fb.group({
      email: [emailFromQuery, [Validators.required, Validators.email]],
      code: ['', [Validators.required]],
    });
  }

  get email() {
    return this.confirmForm.get('email');
  }

  get code() {
    return this.confirmForm.get('code');
  }

  onSubmit(): void {
    if (this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const data: ConfirmRequest = this.confirmForm.value;

    this._authService.checkConfirm(data).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.succeeded) {
          this._notifications.showSuccess(
            response.message ||
              'Account confirmed successfully. You can login now.',
            'Success',
          );
          this._router.navigate(['/login'], {
            queryParams: { email: data.email },
          });
        } else {
          this._notifications.showError(
            response.message || 'Confirmation failed. Please try again.',
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
