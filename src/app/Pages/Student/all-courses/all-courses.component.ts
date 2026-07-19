import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RatingModule } from 'primeng/rating';
import { PaginatorModule } from 'primeng/paginator';
import { finalize } from 'rxjs';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseCategoryToReturnDTO } from '../../../Core/Interfaces/CourseCategories/course-Category-to-return-dto';
import { CoursesParams } from '../../../Core/Interfaces/Courses/courses-params';
import { CoursesToReturnDTO } from '../../../Core/Interfaces/Courses/courses-to-return-dto';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { EnrollmentWithCourseResponse } from '../../../Core/Interfaces/Enrollments/enrollment-with-course-response';
import { CourseCategoriesService } from '../../../Core/Services/CourseCategory/course-Categories.service';
import { CoursesService } from '../../../Core/Services/Courses/courses.service';
import { EnrollmentService } from '../../../Core/Services/Enrollments/enrollment.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { LoadingSkeletonComponent } from '../../../Shared/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-all-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RatingModule,
    PaginatorModule,
    LoadingSkeletonComponent,
  ],
  templateUrl: './all-courses.component.html',
  styleUrl: './all-courses.component.scss',
})
export class AllCoursesComponent implements OnInit {
  courses: CoursesToReturnDTO[] = [];
  categories: CourseCategoryToReturnDTO[] = [];
  selectedCategoryId: number | null = null;

  first = 0;
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;

  // Holds all courses of the selected category when filtering client-side
  private allFilteredCourses: CoursesToReturnDTO[] = [];

  courseParams = new CoursesParams();
  isLoadingCourses = false;
  isLoadingCategories = false;
  searchTimeout: any;

  constructor(
    private readonly _courseService: CoursesService,
    private readonly _enrollmentServices: EnrollmentService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
    private readonly _courseCategoriesService: CourseCategoriesService,
    private readonly _route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this._route.queryParams.subscribe((params) => {
      this.courseParams.sort = params['sort'] || '';
      this.loadCategories();
      this.loadCourses();
    });
  }

  loadCourses(): void {
    this.isLoadingCourses = true;

    if (this.selectedCategoryId === null) {
      // No category filter: use backend pagination directly
      const params: CoursesParams = {
        ...this.courseParams,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };

      this._courseService
        .getAllCourses(params)
        .pipe(finalize(() => (this.isLoadingCourses = false)))
        .subscribe({
          next: (res: ApplicationResult<Pagination<CoursesToReturnDTO[]>>) => {
            if (res.succeed && res.data) {
              this.courses = res.data.data;
              this.totalCount = res.data.count;
            } else {
              this.courses = [];
              this.totalCount = 0;
            }
          },
          error: () => {
            this.courses = [];
            this.totalCount = 0;
          },
        });
    } else {
      // Category filter selected: fetch all matching courses once,
      // then paginate them locally so the paginator reflects the filtered count
      const params: CoursesParams = {
        ...this.courseParams,
        pageIndex: 1,
        pageSize: 9999,
      };

      this._courseService
        .getAllCourses(params)
        .pipe(finalize(() => (this.isLoadingCourses = false)))
        .subscribe({
          next: (res: ApplicationResult<Pagination<CoursesToReturnDTO[]>>) => {
            const all = res.succeed && res.data ? res.data.data : [];
            this.allFilteredCourses = all.filter(
              (course) => course.courseCategoryId === this.selectedCategoryId,
            );
            this.totalCount = this.allFilteredCourses.length;
            this.paginateFilteredCourses();
          },
          error: () => {
            this.allFilteredCourses = [];
            this.courses = [];
            this.totalCount = 0;
          },
        });
    }
  }

  private paginateFilteredCourses(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    this.courses = this.allFilteredCourses.slice(start, start + this.pageSize);
  }

  loadCategories(): void {
    this.isLoadingCategories = true;

    this._courseCategoriesService
      .getAllCourseCategories()
      .pipe(finalize(() => (this.isLoadingCategories = false)))
      .subscribe({
        next: (res: ApplicationResult<CourseCategoryToReturnDTO[]>) => {
          this.categories = res.succeed && res.data ? res.data : [];
        },
        error: () => {
          this.categories = [];
        },
      });
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.pageIndex = 1;
    this.first = 0;
    this.loadCourses();
  }

  onPageChange(event: any): void {
    const rows = event.rows ?? this.pageSize;
    const page = event.page ?? 0;
    this.first = event.first ?? 0;
    this.pageSize = rows;
    this.pageIndex = page + 1;

    if (this.selectedCategoryId !== null) {
      this.paginateFilteredCourses();
    } else {
      this.loadCourses();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.courseParams.search = input.value;
      this.pageIndex = 1;
      this.first = 0;
      this.loadCourses();
    }, 500);
  }

  resetFilters(): void {
    this.selectedCategoryId = null;
    this.courseParams.search = '';
    this.pageIndex = 1;
    this.first = 0;
    this.loadCourses();
  }

  viewCourseDetails(course: CoursesToReturnDTO): void {
    this._router.navigate(['/student', 'course-details', course.id], {
      queryParams: { type: this.getCourseTypeParam(course) },
    });
  }

  enrollInCourse(course: CoursesToReturnDTO): void {
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
            return;
          }

          this._notifications.showError(
            res.message || 'Enrollment failed',
            'Enrollment',
          );
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
