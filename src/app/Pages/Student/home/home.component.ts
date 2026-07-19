import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesToReturnDTO } from '../../../Core/Interfaces/Courses/courses-to-return-dto';
import { CoursesParams } from '../../../Core/Interfaces/Courses/courses-params';
import { CoursesService } from '../../../Core/Services/Courses/courses.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { EnrollmentService } from '../../../Core/Services/Enrollments/enrollment.service';
import { EnrollmentWithCourseResponse } from '../../../Core/Interfaces/Enrollments/enrollment-with-course-response';
import { RatingModule } from 'primeng/rating';
import { finalize } from 'rxjs';
import { CourseOptionsSorting } from '../../../Core/Interfaces/Courses/course-options-sorting';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RatingModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  // Section course lists (8 courses each)
  topRatedCourses: CoursesToReturnDTO[] = [];
  popularCourses: CoursesToReturnDTO[] = [];
  newestCourses: CoursesToReturnDTO[] = [];

  // Loading flags per section
  isLoadingTopRated = false;
  isLoadingPopular = false;
  isLoadingNewest = false;

  // Global state
  courseParams = new CoursesParams();
  error: string | null = null;
  searchTimeout: any;

  // Number of courses to display per section
  readonly sectionSize = 8;

  constructor(
    private readonly _courseService: CoursesService,
    private readonly _enrollmentServices: EnrollmentService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
  ) {}

  ngOnInit() {
    this.loadAllSections();
  }

  // Load all three sections in parallel
  loadAllSections() {
    this.loadSectionCourses(CourseOptionsSorting.Rating, 'topRated');
    this.loadSectionCourses(CourseOptionsSorting.Popular, 'popular');
    this.loadSectionCourses(CourseOptionsSorting.Newest, 'newest');
  }

  // Fetch a single section of courses by sort option
  loadSectionCourses(
    sort: CourseOptionsSorting,
    section: 'topRated' | 'popular' | 'newest',
  ) {
    const loadingFlag =
      section === 'topRated'
        ? 'isLoadingTopRated'
        : section === 'popular'
          ? 'isLoadingPopular'
          : 'isLoadingNewest';

    (this as any)[loadingFlag] = true;

    const params: CoursesParams = {
      ...this.courseParams,
      pageIndex: 1,
      pageSize: this.sectionSize,
      sort,
    };

    this._courseService
      .getAllCourses(params)
      .pipe(finalize(() => ((this as any)[loadingFlag] = false)))
      .subscribe({
        next: (res: ApplicationResult<Pagination<CoursesToReturnDTO[]>>) => {
          if (res.succeed && res.data) {
            (this as any)[section + 'Courses'] = res.data.data;
          } else {
            (this as any)[section + 'Courses'] = [];
          }
        },
        error: () => {
          (this as any)[section + 'Courses'] = [];
        },
      });
  }

  // Search with debounce
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.courseParams.search = query;
      this.loadAllSections();
    }, 500);
  }

  // Navigate to course details
  viewCourseDetails(course: CoursesToReturnDTO) {
    this._router.navigate(['/student', 'course-details', course.id], {
      queryParams: { type: this.getCourseTypeParam(course) },
    });
  }

  // Enroll in a course
  enrollInCourse(course: CoursesToReturnDTO) {
    this._enrollmentServices
      .createEnrollment({ courseId: course.id })
      .subscribe({
        next: (res: ApplicationResult<EnrollmentWithCourseResponse>) => {
          if (res.succeed && res.data) {
            if (course.isPaid) {
              this._notifications.showSuccess(
                res.message || 'Enrollment created. Complete your payment.',
                'Enrollment',
              );
              this._router.navigate(
                ['/student', 'payment', res.data.enrollmentId],
                {
                  queryParams: { type: this.getCourseTypeParam(course) },
                },
              );
              return;
            }

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
      });
  }

  isOnlineCourse(type: string): boolean {
    const normalizedStatus = this.normalizeCourseType(type);
    return normalizedStatus === 'onlinecourse' || normalizedStatus === '0';
  }

  getCourseTypeLabel(type: string): string {
    return this.isOnlineCourse(type) ? 'Online' : 'Recorded';
  }

  private getCourseTypeParam(course: CoursesToReturnDTO): string {
    const normalizedType = this.normalizeCourseType(course.type);

    if (normalizedType === 'onlinecourse' || normalizedType === '0') {
      return 'OnlineCourse';
    }

    if (
      normalizedType === 'recordercourse' ||
      normalizedType === 'recordedcourse' ||
      normalizedType === '1'
    ) {
      return 'RecorderCourse';
    }

    return this.isOnlineCourse(course.type) ? 'OnlineCourse' : 'RecorderCourse';
  }

  private normalizeCourseType(type: string): string {
    return String(type ?? '')
      .replace(/\s+/g, '')
      .toLowerCase();
  }
}
