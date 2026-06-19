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
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PaginatorModule],
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
  first: number = 0;
  pageSize: number = 10; // rows
  pageIndex: number = 1;
  courseCount: number = 0;
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

    this._courseService.getAllCourses(this.courseParams).subscribe({
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
              this._router.navigate([
                '/student',
                'payment',
                res.data.enrollmentId,
              ]);
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
    this._courseTypesService.getAllCourseTypes().subscribe({
      next: (res: ApplicationResult<CourseTypeToReturnDTO[]>) => {
        if (res.succeed && res.data) {
          this.types = res.data;
        }
      },
    });
  }

  isOnlineCourse(status: string): boolean {
    const normalizedStatus = this.normalizeCourseStatus(status);
    return normalizedStatus === 'onlinecourse' || normalizedStatus === '0';
  }

  getCourseStatusLabel(status: string): string {
    return this.isOnlineCourse(status) ? 'Online' : 'Recorded';
  }

  private normalizeCourseStatus(status: string): string {
    return String(status ?? '')
      .replace(/\s+/g, '')
      .toLowerCase();
  }
}
