import { RefundRequest } from './../../../Core/Interfaces/Refunds/refund-request';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesService } from '../../../Core/Services/Courses/courses.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseDetailsToReturnDTO } from '../../../Core/Interfaces/Courses/course-details-to-return-dto';
import { RefundResponse } from '../../../Core/Interfaces/Refunds/refund-response';
import { RefundsService } from '../../../Core/Services/Refunds/refunds.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { CourseType } from '../../../Core/Interfaces/Courses/course-type';

@Component({
  selector: 'app-refunded',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './refunded.component.html',
  styleUrl: './refunded.component.scss',
})
export class RefundedComponent {
  enrollmentId!: number;
  courseId!: number;
  course!: CourseDetailsToReturnDTO;
  cancellationReason: string | null = null;
  request!: RefundRequest;
  isSubmitting = false;
  type!: CourseType;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _courseService: CoursesService,
    private readonly _refundService: RefundsService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
  ) {}

  ngOnInit(): void {
    this.enrollmentId = this._route.snapshot.params['enrollmentId'];
    this.courseId = this._route.snapshot.params['courseId'];

    this.getCourseDetails();
  }

  getCourseDetails() {
    this._courseService.getCourseDetails(this.courseId, this.type).subscribe({
      next: (res: ApplicationResult<CourseDetailsToReturnDTO>) => {
        if (res.succeed && res.data) {
          this.course = res.data;
        }
      },
    });
  }

  goBack(): void {
    this._router.navigate(['/student', 'my-courses']);
  }

  refund() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const data: RefundRequest = {
      enrollmentId: this.enrollmentId,
      cancellationReason: this.cancellationReason,
    };

    this._refundService.createRefund(data).subscribe({
      next: (res: ApplicationResult<RefundResponse>) => {
        if (res.succeed) {
          this._notifications.showSuccess(
            res.message || 'Refund successful',
            'Refund',
          );
          this._router.navigate(['/student', 'my-courses']);
        } else {
          this._notifications.showError(
            res.message || 'Refund failed',
            'Refund',
          );
        }
      },
      error: () => {
        this._notifications.showError(
          'Something went wrong. Please try again.',
          'Refund',
        );
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
