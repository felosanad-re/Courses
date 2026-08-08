import { Injectable } from '@angular/core';
import { NotificationsService } from '../notifications.service';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';

@Injectable({
  providedIn: 'root',
})
export class AccountActionsService {
  constructor(
    private readonly _notifications: NotificationsService,
    private readonly _confirmationService: ConfirmationService,
  ) {}

  accountAction(
    confirmMessage: string,
    succeededMessage: string,
    WarningMessage: string,
    requestFactory: () => Observable<ApplicationResult<boolean>>,
    onSuccess?: () => void,
  ): void {
    this._confirmationService.confirm({
      message: confirmMessage,
      header: 'Confirm account action',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'dialog-confirm-button',
      rejectButtonStyleClass: 'dialog-cancel-button',
      accept: () => {
        requestFactory().subscribe((res: ApplicationResult<boolean>) => {
          if (res.succeed) {
            this._notifications.showSuccess(succeededMessage, 'Success');
            onSuccess?.();
          }
        });
      },
      reject: () => {
        this._notifications.showWarning(WarningMessage, 'Warning');
      },
    });
  }
}
