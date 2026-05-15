import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoursesToReturnDTO } from '../../../Core/Interfaces/Courses/courses-to-return-dto';
import { CoursesParams } from '../../../Core/Interfaces/Courses/courses-params';
import { CoursesService } from '../../../Core/Services/Courses/courses.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { CourseTypeService } from '../../../Core/Services/CourseType/course-type.service';
import { CourseTypeToReturnDTO } from '../../../Core/Interfaces/courseTypes/course-type-to-return-dto';
import { EnrollmentService } from '../../../Core/Services/Enrollments/enrollment.service';
import { EnrollmentWithCourseResponse } from '../../../Core/Interfaces/Enrollments/enrollment-with-course-response';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  courses: CoursesToReturnDTO[] = [];
  types: CourseTypeToReturnDTO[] = [];
  courseParams = new CoursesParams();
  isLoading = false;
  error: string | null = null;
  noCoursesMessage: string = 'No courses available at the moment.';
  pagination = {
    pageIndex: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0,
  };
  searchTimeout: any;

  constructor(
    private readonly _courseService: CoursesService,
    private readonly _courseTypesService: CourseTypeService,
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
  onPageChange(pageIndex: number): void {
    if (pageIndex < 1 || pageIndex > this.pagination.totalPages) return;
    this.courseParams.pageIndex = pageIndex;
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

  // Get visible page numbers for pagination
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const current = this.pagination.pageIndex;
    const total = this.pagination.totalPages;

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Fetch all courses from API
  getAllCourses(isSearch: boolean = false) {
    this.isLoading = true;
    this.error = null;

    if (!isSearch) {
      this.courseParams.pageIndex = 1;
    }

    this._courseService.getAllCourses(this.courseParams).subscribe({
      next: (res: ApplicationResult<Pagination<CoursesToReturnDTO[]>>) => {
        if (res.succeed && res.data) {
          this.courses = res.data.data;
          this.pagination = {
            pageIndex: res.data.pageIndex,
            pageSize: res.data.pageSize,
            totalCount: res.data.count,
            totalPages: Math.ceil(res.data.count / res.data.pageSize),
          };
          this.noCoursesMessage =
            res.message || 'No courses available at the moment.';
        } else {
          this.courses = [];
          this.noCoursesMessage =
            res.message || 'No courses available at the moment.';
        }
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  // Navigate to course details
  viewCourseDetails(courseId: number) {
    this._router.navigate(['/student', 'course-details', courseId]);
  }

  // Enroll in a course
  enrollInCourse(courseId: number) {
    this._enrollmentServices.createEnrollment({ courseId }).subscribe({
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

  // Fetch course types for filter chips
  getAllCoursesTypes() {
    this._courseTypesService.getAllCourseTypes().subscribe({
      next: (res: ApplicationResult<CourseTypeToReturnDTO[]>) => {
        if (res.succeed && res.data) {
          this.types = res.data;
        }
      },
    });
  }
}
