import { Component, OnInit } from '@angular/core';
import { ApplyInstructorResponse } from '../../../Core/Interfaces/InstructorsRequest/apply-instructor-response';
import { AdminInstructorRequestService } from '../../../Core/Services/Admin/admin-instructor-request.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { InstructorRequestParams } from '../../../Core/Interfaces/AdminInterfaces/instructor-request-params';
import { finalize } from 'rxjs';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { ApplyInstructorDetailsResponse } from '../../../Core/Interfaces/InstructorsRequest/apply-instructor-details-response';
import { PaginatorState } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-admin-instructor-request',
  standalone: true,
  imports: [
    SkeletonModule,
    TableModule,
    CommonModule,
    ButtonModule,
    ConfirmDialogModule,
    FormsModule,
    DialogModule,
    TooltipModule,
  ],
  templateUrl: './admin-instructor-request.component.html',
  styleUrl: './admin-instructor-request.component.scss',
  providers: [ConfirmationService],
})
export class AdminInstructorRequestComponent implements OnInit {
  requests: ApplyInstructorResponse[] = [];
  request: ApplyInstructorDetailsResponse =
    {} as ApplyInstructorDetailsResponse;
  totalCount: number = 0;
  isLoading: boolean = false;
  isLoadingDetails: boolean = false;
  isProcessingRequest: boolean = false;
  instructorRequestParams = new InstructorRequestParams();

  reason: string = '';
  first: number = 0;

  visible: boolean = false;

  constructor(
    private readonly _adminInstructorRequestService: AdminInstructorRequestService,
    private readonly _notifications: NotificationsService,
    private readonly _confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;

    this.instructorRequestParams.pageSize ??= 10;
    this._adminInstructorRequestService
      .getAllRequest(this.instructorRequestParams)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (
          res: ApplicationResult<Pagination<ApplyInstructorResponse[]>>,
        ) => {
          if (res.succeed && res.data) {
            this.requests = res.data.data;
            this.totalCount = res.data.count;
          }
        },
      });
  }

  getRequestDetails(req: ApplyInstructorResponse): void {
    this.request = {} as ApplyInstructorDetailsResponse;
    this.visible = true;
    this.isLoadingDetails = true;

    this._adminInstructorRequestService
      .getRequestDetails(req.id)
      .pipe(finalize(() => (this.isLoadingDetails = false)))
      .subscribe({
        next: (res: ApplicationResult<ApplyInstructorDetailsResponse>) => {
          if (res.succeed && res.data) {
            this.request = res.data;
          }
        },
        error: () => (this.visible = false),
      });
  }

  approveRequest(req: ApplyInstructorResponse): void {
    this._confirmationService.confirm({
      message: `Are you sure that you want to accept ${req.fullName} as an instructor?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Accept request',
      rejectLabel: 'Cancel',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'dialog-confirm-button',
      rejectButtonStyleClass: 'dialog-cancel-button',
      accept: () => {
        this.isProcessingRequest = true;
        this._adminInstructorRequestService
          .approveRequest(req.id)
          .pipe(finalize(() => (this.isProcessingRequest = false)))
          .subscribe({
            next: (res: ApplicationResult<boolean>) => {
              if (res.succeed) {
                this.visible = false;
                this._notifications.showSuccess(
                  'Instructor request accepted successfully',
                  'Success',
                );
                this.loadRequests();
              }
            },
          });
      },
    });
  }

  rejectedRequest(req: ApplyInstructorResponse): void {
    this._confirmationService.confirm({
      message: `Are you sure that you want to reject ${req.fullName}'s instructor request?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Reject request',
      rejectLabel: 'Cancel',
      acceptIcon: 'pi pi-times',
      rejectIcon: 'pi pi-check',
      acceptButtonStyleClass: 'dialog-reject-button',
      rejectButtonStyleClass: 'dialog-cancel-button',
      accept: () => {
        this.isProcessingRequest = true;
        this._adminInstructorRequestService
          .rejectRequest(req.id)
          .pipe(finalize(() => (this.isProcessingRequest = false)))
          .subscribe({
            next: (res: ApplicationResult<boolean>) => {
              if (res.succeed) {
                this.visible = false;
                this._notifications.showSuccess(
                  'Instructor request rejected successfully',
                  'Success',
                );
                this.loadRequests();
              }
            },
          });
      },
    });
  }

  onPageChange(event: PaginatorState): void {
    const pageSize = event.rows ?? this.instructorRequestParams.pageSize ?? 10;
    const first = event.first ?? 0;

    this.first = first;

    this.instructorRequestParams.pageSize = pageSize;
    this.instructorRequestParams.pageIndex = Math.floor(first / pageSize) + 1;
    this.loadRequests();
  }
}
