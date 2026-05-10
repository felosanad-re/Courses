import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { ConfirmResponse } from '../../../Core/Interfaces/Auth/confirm-response';

@Component({
  selector: 'app-confirm-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirm-account.component.html',
  styleUrl: './confirm-account.component.scss',
})
export class ConfirmAccountComponent implements OnInit {
  isSubmitting = false;
  confirmationSuccess = false;
  errorMessage = '';

  constructor(
    private readonly _authService: AuthService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const userId = this._route.snapshot.paramMap.get('userId');
    const token = this._route.snapshot.paramMap.get('token');

    if (userId && token) {
      this.confirmAccount(userId, token);
    } else {
      this.errorMessage = 'Invalid confirmation link';
    }
  }

  confirmAccount(userId: string, token: string): void {
    this.isSubmitting = true;

    this._authService.confirmAccount(userId, token).subscribe({
      next: (response: ApplicationResult<ConfirmResponse>) => {
        this.isSubmitting = false;
        if (response.succeed) {
          this.confirmationSuccess = true;
          this._notifications.showSuccess(
            response.message || 'Account confirmed successfully!',
            'Success',
          );
          setTimeout(() => {
            this._router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Confirmation failed';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
      },
    });
  }
}
