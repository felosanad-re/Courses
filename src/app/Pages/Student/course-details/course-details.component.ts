import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseDetailsToReturnDTO } from '../../../Core/Interfaces/Courses/course-details-to-return-dto';
import { CoursesService } from '../../../Core/Services/Courses/courses.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { EnrollmentService } from '../../../Core/Services/Enrollments/enrollment.service';
import { EnrollmentWithCourseResponse } from '../../../Core/Interfaces/Enrollments/enrollment-with-course-response';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss'],
})
export class CourseDetailsComponent implements OnInit {
  courseId!: number;
  courseDetails!: CourseDetailsToReturnDTO;
  isLoading = false;
  error: string | null = null;
  expandedSections: Record<number, boolean> = {};

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _courseService: CoursesService,
    private readonly _enrollmentService: EnrollmentService,
    private readonly _notifications: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this._route.snapshot.paramMap.get('courseId'));
    this.getCourseDetails();
  }

  getCourseDetails(): void {
    this.isLoading = true;
    this.error = null;

    this._courseService.getCourseDetails(this.courseId).subscribe({
      next: (res: ApplicationResult<CourseDetailsToReturnDTO>) => {
        if (res.succeed && res.data) {
          this.courseDetails = res.data;
          // Expand the first section by default
          this.expandedSections = {};
          if (this.courseDetails.sections.length > 0) {
            this.expandedSections[0] = true;
          }
        } else {
          this.error = res.message || 'Failed to load course details';
        }
      },
      error: () => {
        this.error = 'Something went wrong. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  toggleSection(index: number): void {
    this.expandedSections[index] = !this.expandedSections[index];
  }

  enrollInCourse(): void {
    this._enrollmentService
      .createEnrollment({ courseId: this.courseId })
      .subscribe({
        next: (res: ApplicationResult<EnrollmentWithCourseResponse>) => {
          if (res.succeed && res.data) {
            this._notifications.showSuccess(
              res.message || 'Enrollment successful',
              'Enrollment',
            );
          } else {
            this._notifications.showError(
              res.message || 'Enrollment failed',
              'Enrollment',
            );
          }
        },
        error: () => {
          this._notifications.showError(
            'Something went wrong. Please try again.',
            'Enrollment',
          );
        },
      });
  }

  getTotalLectures(): number {
    return this.courseDetails.sections.reduce(
      (total, section) => total + section.lectures.length,
      0,
    );
  }
}
