import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { SharedCheckAccountComponent } from '../../../Shared/shared-check-account/shared-check-account.component';
import { AccountResponse } from '../../../Core/Interfaces/Auth/account-response';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';

@Component({
  selector: 'app-check-account',
  standalone: true,
  imports: [SharedCheckAccountComponent],
  templateUrl: './check-account.component.html',
  styleUrl: './check-account.component.scss',
})
export class CheckAccountComponent {
  pageTitle = 'Check Account';
  pageSubtitle = 'Find out if you already have an account';
  buttonText = 'Check Account';

  isSubmitting = false;
  private submittedValue = '';

  constructor(
    private readonly _authService: AuthService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
  ) {}

  onFormSubmitted(data: { [key: string]: string }): void {
    const fieldValue = data['userNameOrEmail'] || data['email'];
    this.submittedValue = fieldValue;
    this.isSubmitting = true;

    this._authService.checkAccount({ userNameOrEmail: fieldValue }).subscribe({
      next: (response: ApplicationResult<AccountResponse>) => {
        this.isSubmitting = false;
        this._router.navigate(['/checkOtp'], {
          queryParams: {
            token: response.data.token,
          },
        });
      },
      error: (err) => {
        this.isSubmitting = false;
      },
    });
  }
}
