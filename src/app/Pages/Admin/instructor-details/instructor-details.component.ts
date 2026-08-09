import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminManagementAccountsService } from '../../../Core/Services/Admin/admin-management-accounts.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { AdminInstructorDetailsResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-instructor-details-response';
import { finalize } from 'rxjs';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { AccountActionsService } from '../../../Core/Services/Admin/account-actions.service';
import { AccountActionRequest } from '../../../Core/Interfaces/AdminInterfaces/account-action-request';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-instructor-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmDialogModule,
    InputTextareaModule,
  ],
  templateUrl: './instructor-details.component.html',
  styleUrl: './instructor-details.component.scss',
})
export class InstructorDetailsComponent implements OnInit {
  instructorId: number = 0;
  instructor: AdminInstructorDetailsResponse =
    {} as AdminInstructorDetailsResponse;
  isLoading: boolean = false;
  reason: string = '';

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _adminManagementAccountServices: AdminManagementAccountsService,
    private readonly _accountActions: AccountActionsService,
    private readonly _notification: NotificationsService,
  ) {}
  ngOnInit(): void {
    const param = this._route.snapshot.paramMap.get('instructorId');

    const id = Number(param);
    if (!Number.isInteger(id) || id <= 0) {
      this._notification.showError('Invalid instructor ID', 'Error');
      return;
    }

    this.instructorId = id;

    this.loadInstructorDetails();
  }

  loadInstructorDetails(): void {
    this.isLoading = true;
    this._adminManagementAccountServices
      .getInstructorDetails(this.instructorId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<AdminInstructorDetailsResponse>) => {
          if (res.succeed && res.data) {
            this.instructor = res.data;
          }
        },
      });
  }

  viewCourseDetails(courseId: number, courseType: string): void {
    const type = courseType.replace(/\s+/g, '');

    this._router.navigate(['/admin/course', courseId], {
      queryParams: { type },
    });
  }

  deleteInstructor(instructor: AdminInstructorDetailsResponse): void {
    this._accountActions.accountAction(
      `Are you sure you want to delete instructor ${instructor.name}?`,
      'Instructor deleted successfully',
      'Instructor was not deleted',
      () => {
        const request: AccountActionRequest = { reason: this.reason.trim() };
        return this._adminManagementAccountServices.deleteAccount(
          instructor.userId,
          request,
        );
      },
      () => this.handleActionSuccess(),
    );
  }

  restoreInstructor(instructor: AdminInstructorDetailsResponse): void {
    this._accountActions.accountAction(
      `Are you sure you want to restore instructor ${instructor.name}?`,
      'Instructor restored successfully',
      'Instructor was not restored',
      () =>
        this._adminManagementAccountServices.restoreAccount(instructor.userId),
      () => this.handleActionSuccess(),
    );
  }

  suspendInstructor(instructor: AdminInstructorDetailsResponse): void {
    this._accountActions.accountAction(
      `Are you sure you want to suspend instructor ${instructor.name}?`,
      'Instructor suspended successfully',
      'Instructor was not suspended',
      () => {
        const request: AccountActionRequest = { reason: this.reason.trim() };
        return this._adminManagementAccountServices.suspendAccount(
          instructor.userId,
          request,
        );
      },
      () => this.handleActionSuccess(),
    );
  }

  activateInstructor(instructor: AdminInstructorDetailsResponse): void {
    this._accountActions.accountAction(
      `Are you sure you want to activate instructor ${instructor.name}?`,
      'Instructor activated successfully',
      'Instructor was not activated',
      () =>
        this._adminManagementAccountServices.activateAccount(instructor.userId),
      () => this.handleActionSuccess(),
    );
  }

  private handleActionSuccess(): void {
    this.reason = '';
    this.loadInstructorDetails();
  }
}
