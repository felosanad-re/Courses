import { Component, OnInit } from '@angular/core';
import { AdminInstructorResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-instructor-response';
import { AdminManagementAccountsService } from '../../../Core/Services/Admin/admin-management-accounts.service';
import { Router } from '@angular/router';
import { InstructorParams } from '../../../Core/Interfaces/Instructors/instructor-params';
import { finalize } from 'rxjs';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { AccountActionsService } from '../../../Core/Services/Admin/account-actions.service';
import { AccountActionRequest } from '../../../Core/Interfaces/AdminInterfaces/account-action-request';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorState } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-admin-instructors',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextareaModule,
    SkeletonModule,
    TooltipModule,
  ],
  templateUrl: './admin-instructors.component.html',
  styleUrl: './admin-instructors.component.scss',
})
export class AdminInstructorsComponent implements OnInit {
  isLoading: boolean = false;
  instructors: AdminInstructorResponse[] = [];
  instructorParams = new InstructorParams();
  totalCount: number = 0;
  reason: string = '';
  first: number = 0;

  constructor(
    private readonly _adminManagementAccountsService: AdminManagementAccountsService,
    private readonly _router: Router,
    private readonly _accountActions: AccountActionsService,
  ) {}
  ngOnInit(): void {
    this.loadInstructors();
  }

  loadInstructors(): void {
    this.isLoading = true;
    this.instructorParams.pageSize ??= 10;
    this._adminManagementAccountsService
      .getAllInstructors(this.instructorParams)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (
          res: ApplicationResult<Pagination<AdminInstructorResponse[]>>,
        ) => {
          if (res.succeed && res.data) {
            this.instructors = res.data.data;
            this.totalCount = res.data.count;
          }
        },
      });
  }

  viewDetails(instructor: AdminInstructorResponse): void {
    this._router.navigate([`/admin/instructor/${instructor.id}`]);
  }

  deleteInstructor(instructor: AdminInstructorResponse): void {
    const req: AccountActionRequest = { reason: this.reason.trim() };
    this._accountActions.accountAction(
      `Are you sure you want to delete ${instructor.name}?`,
      'Instructor Deleted Successfully',
      'Instructor Not Deleted',
      () =>
        this._adminManagementAccountsService.deleteAccount(
          instructor.userId,
          req,
        ),
      () => this.loadInstructors(),
    );
  }

  restoreInstructor(instructor: AdminInstructorResponse): void {
    this._accountActions.accountAction(
      `Are you sure you want to restore ${instructor.name}?`,
      'Instructor Restored Successfully',
      'Instructor Not Restored',
      () =>
        this._adminManagementAccountsService.restoreAccount(instructor.userId),
      () => this.loadInstructors(),
    );
  }

  suspendInstructor(instructor: AdminInstructorResponse): void {
    const req: AccountActionRequest = { reason: this.reason.trim() };
    this._accountActions.accountAction(
      `Are you sure you want to suspend ${instructor.name}?`,
      'Instructor Suspended Successfully',
      'Instructor Not Suspended',
      () =>
        this._adminManagementAccountsService.suspendAccount(
          instructor.userId,
          req,
        ),
      () => this.loadInstructors(),
    );
  }

  activeInstructor(instructor: AdminInstructorResponse): void {
    this._accountActions.accountAction(
      `Are you sure you want to active ${instructor.name}?`,
      'Instructor Activated Successfully',
      'Instructor Not Activated',
      () =>
        this._adminManagementAccountsService.activateAccount(instructor.userId),
      () => this.loadInstructors(),
    );
  }

  onPageChange(event: PaginatorState): void {
    const pageSize = event.rows ?? this.instructorParams.pageSize ?? 10;
    const first = event.first ?? 0;

    this.first = first;

    this.instructorParams.pageSize = pageSize;
    this.instructorParams.pageIndex = Math.floor(first / pageSize) + 1;

    this.loadInstructors();
  }
}
