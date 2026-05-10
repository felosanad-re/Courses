import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { SharedCheckAccountComponent } from '../../../Shared/shared-check-account/shared-check-account.component';

@Component({
  selector: 'app-check-confirm',
  standalone: true,
  imports: [SharedCheckAccountComponent],
  templateUrl: './check-confirm.component.html',
  styleUrl: './check-confirm.component.scss',
})
export class CheckConfirmComponent {
  pageTitle = 'Check Confirmation';
  pageSubtitle = 'Verify your account status';
  buttonText = 'Check Status';
  fieldName = 'email';

  isSubmitting = false;
  private submittedValue = '';

  constructor(
    private readonly _authService: AuthService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
  ) {}

  onFormSubmitted(data: { [key: string]: string }): void {
    const userNameOrEmail = data[this.fieldName] || data['userNameOrEmail'];
    this.submittedValue = userNameOrEmail;
    this.isSubmitting = true;

    this._authService.checkEmailConfirmation({ userNameOrEmail }).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        const result = response.data || response;

        if (result.exists && result.isConfirmed) {
          this._notifications.showSuccess(
            'Account is already confirmed. You can login now.',
            'Success',
          );
          this._router.navigate(['/login'], {
            queryParams: { email: this.submittedValue },
          });
        } else if (result.exists && !result.isConfirmed) {
          this._notifications.showSuccess(
            'Confirmation email has been sent. Please check your inbox.',
            'Success',
          );
          this._router.navigate(['/login'], {
            queryParams: { email: this.submittedValue },
          });
        } else {
          this._notifications.showWarning(
            'Account not found. Please register first.',
            'Warning',
          );
          this._router.navigate(['/register'], {
            queryParams: { email: this.submittedValue },
          });
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this._notifications.showError(
          err?.error?.message || 'Something went wrong',
          'Error',
        );
      },
    });
  }
}
