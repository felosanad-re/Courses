import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoursesToReturnDTO } from '../../../Core/Interfaces/Courses/courses-to-return-dto';
import { CourseDetailsToReturnDTO } from '../../../Core/Interfaces/Courses/course-details-to-return-dto';
import { CoursesParams } from '../../../Core/Interfaces/Courses/courses-params';
import { CoursesService } from '../../../Core/Services/Courses/courses.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  courses: CoursesToReturnDTO[] = [];
  courseDetails!: CourseDetailsToReturnDTO;
  courseParams = new CoursesParams();
  isLoading = false;
  error: string | null = null;
  noCoursesMessage: string = 'No courses available at the moment.';
  pagination: any = {
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  };
  searchTimeout: any;

  constructor(
    private readonly _courseService: CoursesService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
  ) {}

  ngOnInit() {
    this.getAllCourses();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.courseParams.search = query;
      this.getAllCourses(true);
    }, 500);
  }

  onPageChange(pageIndex: number): void {
    this.courseParams.pageIndex = pageIndex;
    this.getAllCourses();
  }

  getPageNumbers(): number[] {
    const pages = [];
    const current = this.pagination.pageIndex;
    const total = this.pagination.totalPages;

    // Show up to 5 page numbers around current page
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getAllCourses(isSearch: boolean = false) {
    this.isLoading = true;
    this.error = null;

    if (!isSearch) {
      this.courseParams.pageIndex = 1;
    }

    this._courseService.getAllCourses(this.courseParams).subscribe({
      next: (res: ApplicationResult<Pagination<CoursesToReturnDTO[]>>) => {
        const data = res.data.data;
        if (res.succeed && res.data) {
          this.courses = data;
          // Error
          this.pagination = {
            pageIndex: res.data.pageIndex,
            pageSize: res.data.pageSize,
            totalCount: res.data.count,
            totalPages: Math.ceil(res.data.count / res.data.pageSize),
          };
          this.noCoursesMessage =
            res.message || 'No courses available at the moment.';
          this._notifications.showSuccess(
            res.message || 'Courses loaded successfully',
            'Courses',
          );
        } else {
          this.noCoursesMessage =
            res.message || 'No courses available at the moment.';
        }
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  viewCourseDetails(courseId: number) {
    this._router.navigate(['/student', 'course-details', courseId]);
  }

  enrollInCourse(courseId: number) {
    this._notifications.showSuccess(
      'Enrollment process started for course: ' + courseId,
      'Enrollment',
    );
  }
}
