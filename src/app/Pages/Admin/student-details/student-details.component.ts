import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminManagementAccountsService } from '../../../Core/Services/Admin/admin-management-accounts.service';
import { ActivatedRoute } from '@angular/router';
import { AdminWithStudentDetailsResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-with-student-details-response';
import { finalize } from 'rxjs';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { AccountActionsService } from '../../../Core/Services/Admin/account-actions.service';
import { AdminWithStudentResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-with-student-response';
import { AccountActionRequest } from '../../../Core/Interfaces/AdminInterfaces/account-action-request';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, FormsModule],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.scss',
})
export class StudentDetailsComponent implements OnInit {
  isLoading: boolean = false;
  studentId: number = 0;
  student: AdminWithStudentDetailsResponse =
    {} as AdminWithStudentDetailsResponse;
  reason: string = '';

  constructor(
    private readonly _adminManagementAccountsService: AdminManagementAccountsService,
    private readonly _accountActionsService: AccountActionsService,
    private readonly _route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.studentId = this._route.snapshot.params['studentId'];
    this.loadStudentDetails();
  }

  loadStudentDetails(): void {
    this.isLoading = true;
    this._adminManagementAccountsService
      .getStudentDetails(this.studentId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<AdminWithStudentDetailsResponse>) => {
          if (res.succeed && res.data) {
            this.student = res.data;
          }
        },
      });
  }

  deleteStudent(student: AdminWithStudentDetailsResponse): void {
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
      () => this.loadStudentDetails(),
    );
  }

  suspendStudent(student: AdminWithStudentDetailsResponse): void {
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
      () => this.loadStudentDetails(),
    );
  }

  activeStudent(student: AdminWithStudentDetailsResponse): void {
    this._accountActionsService.accountAction(
      `Are you sure that you want to Active Student ${student.name}?`,
      'Student Activated successfully',
      'student not Activated',
      () =>
        this._adminManagementAccountsService.activateAccount(student.userId),
      () => this.loadStudentDetails(),
    );
  }

  restoreStudent(student: AdminWithStudentDetailsResponse): void {
    this._accountActionsService.accountAction(
      `Are you sure that you want to restore Student ${student.name}?`,
      'Student restored successfully',
      'student not restored',
      () => this._adminManagementAccountsService.restoreAccount(student.userId),
      () => this.loadStudentDetails(),
    );
  }
}
