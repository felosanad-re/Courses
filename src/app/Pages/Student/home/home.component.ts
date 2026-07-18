import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoursesToReturnDTO } from '../../../Core/Interfaces/Courses/courses-to-return-dto';
import { CoursesParams } from '../../../Core/Interfaces/Courses/courses-params';
import { CoursesService } from '../../../Core/Services/Courses/courses.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { CourseCategoriesService } from '../../../Core/Services/CourseCategory/course-Categories.service';
import { CourseCategoryToReturnDTO } from '../../../Core/Interfaces/CourseCategories/course-Category-to-return-dto';
import { EnrollmentService } from '../../../Core/Services/Enrollments/enrollment.service';
import { EnrollmentWithCourseResponse } from '../../../Core/Interfaces/Enrollments/enrollment-with-course-response';
import { PaginatorModule } from 'primeng/paginator';
import { finalize } from 'rxjs';
import { RatingModule } from 'primeng/rating';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PaginatorModule, RatingModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  courses: CoursesToReturnDTO[] = [];
  types: CourseCategoryToReturnDTO[] = [];
  courseParams = new CoursesParams();
  isLoading = false;
  error: string | null = null;
  noCoursesMessage: string = 'No courses available at the moment.';
  first: number = 0;
  pageSize: number = 10; // rows
  pageIndex: number = 1;
  courseCount: number = 0;
  searchTimeout: any;

  constructor(
    private readonly _courseService: CoursesService,
    private readonly _courseCategoriesService: CourseCategoriesService,
    private readonly _enrollmentServices: EnrollmentService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
  ) {}

  ngOnInit() {
    this.getAllCourses();
    this.getAllCoursesTypes();
  }

  // Search with debounce
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.courseParams.search = query;
      this.getAllCourses(true);
    }, 500);
  }

  // Pagination
  onPageChange(event: any): void {
    this.first = event.first ?? 0;
    this.pageSize = event.rows ?? 10;
    this.pageIndex = Math.floor(this.first / this.pageSize) + 1;
    this.getAllCourses(true);
  }

  // Filter by course type
  filterByType(typeId: number): void {
    this.courseParams.type = String(typeId);
    this.getAllCourses(true);
  }

  // Check if a type chip is active
  isActiveType(typeId: number): boolean {
    return this.courseParams.type === String(typeId);
  }

  // Clear type filter
  clearFilter(): void {
    this.courseParams.type = undefined;
    this.getAllCourses(true);
  }

  // Fetch all courses from API
  getAllCourses(isSearch: boolean = false) {
    this.isLoading = true;
    this.error = null;

    if (!isSearch) {
      this.courseParams.pageIndex = 1;
    }

    this.courseParams.pageIndex = this.pageIndex;
    this.courseParams.pageSize = this.pageSize;

    this.courseParams.sort = 'Rating';
    this._courseService
      .getAllCourses(this.courseParams)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<Pagination<CoursesToReturnDTO[]>>) => {
          if (res.succeed && res.data) {
            this.courses = res.data.data;
            this.courseCount = res.data.count;
            this.noCoursesMessage =
              res.message || 'No courses available at the moment.';
          } else {
            this.courses = [];
            this.noCoursesMessage =
              res.message || 'No courses available at the moment.';
          }
        },
      });
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
              const type = course.type.toLowerCase();
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

  // Fetch course types for filter chips
  getAllCoursesTypes() {
    this._courseCategoriesService.getAllCourseCategories().subscribe({
      next: (res: ApplicationResult<CourseCategoryToReturnDTO[]>) => {
        if (res.succeed && res.data) {
          this.types = res.data;
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
