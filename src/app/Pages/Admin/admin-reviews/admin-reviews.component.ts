import { Component, OnInit } from '@angular/core';
import { AdminReviewsResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-reviews-response';
import { AdminReviewsService } from '../../../Core/Services/Admin/admin-reviews.service';
import { ReviewsParams } from '../../../Core/Interfaces/AdminInterfaces/reviews-params';
import { finalize } from 'rxjs';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { AdminReviewDetailsResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-review-details-response';
import { Router } from '@angular/router';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { PaginatorState } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    ConfirmDialogModule,
  ],
  templateUrl: './admin-reviews.component.html',
  styleUrl: './admin-reviews.component.scss',
})
export class AdminReviewsComponent implements OnInit {
  reviews: AdminReviewsResponse[] = [];
  review: AdminReviewDetailsResponse = {} as AdminReviewDetailsResponse;
  totalCount: number = 0;
  isLoading: boolean = false;
  isLoadingDetails: boolean = false;
  reviewParams = new ReviewsParams();
  first: number = 0;

  visible: boolean = false;

  constructor(
    private readonly _adminReviewsService: AdminReviewsService,
    private readonly _router: Router,
    private readonly _notifications: NotificationsService,
    private readonly _confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;

    this.reviewParams.pageSize ??= 10;

    this._adminReviewsService
      .getAllReviews(this.reviewParams)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<Pagination<AdminReviewsResponse[]>>) => {
          if (res.succeed && res.data) {
            this.reviews = res.data.data;
            this.totalCount = res.data.count;
            return;
          }

          this.resetReviews();
        },
        error: () => this.resetReviews(),
      });
  }

  deleteReview(reviewId: number): void {
    this.isLoadingDetails = true;

    this._adminReviewsService
      .deleteReview(reviewId)
      .pipe(finalize(() => (this.isLoadingDetails = false)))
      .subscribe({
        next: (res: ApplicationResult<boolean>) => {
          if (res.succeed) {
            this._notifications.showSuccess(
              res.message || 'Review deleted successfully',
              'Delete Review',
            );
            this.loadReviews();
          }
        },
      });
  }

  onPageChange(event: PaginatorState): void {
    const pageSize = event.rows ?? this.reviewParams.pageSize ?? 10;
    const first = event.first ?? 0;

    this.first = first;

    this.reviewParams.pageSize = pageSize;
    this.reviewParams.pageIndex = Math.floor(first / pageSize) + 1;

    this.loadReviews();
  }

  viewCourse(courseId: number): void {
    this._router.navigate(['/admin/course', courseId]);
  }

  showDialog(reviewId: number): void {
    this.review = {} as AdminReviewDetailsResponse;
    this.visible = true;
    this.isLoadingDetails = true;

    this._adminReviewsService
      .getReviewDetails(reviewId)
      .pipe(finalize(() => (this.isLoadingDetails = false)))
      .subscribe({
        next: (res: ApplicationResult<AdminReviewDetailsResponse>) => {
          if (res.succeed && res.data) {
            this.review = res.data;
          }
        },
        error: () => (this.visible = false),
      });
  }

  confirm(review: AdminReviewsResponse) {
    this._confirmationService.confirm({
      message: 'Are you sure that you want to delete this review?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteReview(review.id);
      },
      reject: () => {
        this._notifications.showWarning('Review not deleted', 'Warning');
      },
    });
  }

  private resetReviews(): void {
    this.reviews = [];
    this.totalCount = 0;
  }
}
