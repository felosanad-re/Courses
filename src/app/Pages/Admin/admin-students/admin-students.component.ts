import { Component, OnInit } from '@angular/core';
import { AdminWithStudentResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-with-student-response';
import { AdminManagementAccountsService } from '../../../Core/Services/Admin/admin-management-accounts.service';
import { Router } from '@angular/router';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { StudentParams } from '../../../Core/Interfaces/Instructors/student-params';
import { finalize, Observable } from 'rxjs';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AccountActionRequest } from '../../../Core/Interfaces/AdminInterfaces/account-action-request';
import { AccountActionsService } from '../../../Core/Services/Admin/account-actions.service';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    SkeletonModule,
    ConfirmDialogModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    FormsModule,
    InputTextareaModule,
  ],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.scss',
})
export class AdminStudentsComponent implements OnInit {
  students: AdminWithStudentResponse[] = [];
  isLoading: boolean = false;
  studentParam = new StudentParams();
  reason: string = '';

  // Paginator
  totalCount: number = 0;
  first: number = 0;
  constructor(
    private readonly _adminManagementAccountsService: AdminManagementAccountsService,
    private readonly _router: Router,
    private readonly _notifications: NotificationsService,
    private readonly _accountActionsService: AccountActionsService,
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentParam.pageSize ??= 10;

    this._adminManagementAccountsService
      .getAllStudents(this.studentParam)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (
          res: ApplicationResult<Pagination<AdminWithStudentResponse[]>>,
        ) => {
          if (res.succeed && res.data) {
            this.students = res.data.data;
            this.totalCount = res.data.count;
          }
        },
      });
  }

  viewDetails(student: AdminWithStudentResponse): void {
    this._router.navigate([`/admin/student/${student.id}`]);
  }

  deleteStudent(student: AdminWithStudentResponse): void {
    this._accountActionsService.accountAction(
      `Are you sure that you want to Delete Student ${student.name}?`,
      'Student Deleted successfully',
      'student not deleted',
      () => {
        const request: AccountActionRequest = { reason: this.reason.trim() };
        return this._adminManagementAccountsService.deleteAccount(
          student.userId,
          request,
        );
      },
      () => this.loadStudents(),
    );
  }

  suspendStudent(student: AdminWithStudentResponse): void {
    this._accountActionsService.accountAction(
      `Are you sure that you want to Suspend Student ${student.name}?`,
      'Student Suspended successfully',
      'student not suspended',
      () => {
        const request: AccountActionRequest = { reason: this.reason.trim() };
        return this._adminManagementAccountsService.suspendAccount(
          student.userId,
          request,
        );
      },
      () => this.loadStudents(),
    );
  }

  activeStudent(student: AdminWithStudentResponse): void {
    this._accountActionsService.accountAction(
      `Are you sure that you want to Active Student ${student.name}?`,
      'Student Activated successfully',
      'student not Activated',
      () =>
        this._adminManagementAccountsService.activateAccount(student.userId),
      () => this.loadStudents(),
    );
  }

  restoreStudent(student: AdminWithStudentResponse): void {
    this._accountActionsService.accountAction(
      `Are you sure that you want to restore Student ${student.name}?`,
      'Student restored successfully',
      'student not restored',
      () => this._adminManagementAccountsService.restoreAccount(student.userId),
      () => this.loadStudents(),
    );
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    const pageSize = event.rows ?? this.studentParam.pageSize;
    const first = event.first ?? 0;
    const pageIndex = Math.floor(first / pageSize) + 1;

    this.first = first;
    this.studentParam.pageIndex = pageIndex;
    this.studentParam.pageSize = pageSize;
    this.loadStudents();
  }
}
