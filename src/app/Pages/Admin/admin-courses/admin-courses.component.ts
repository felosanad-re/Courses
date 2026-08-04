import { UpdateCourseStatusRequest } from './../../../Core/Interfaces/AdminInterfaces/update-course-status-request';
import { Router } from '@angular/router';
import { AdminManagementCoursesService } from './../../../Core/Services/Admin/admin-management-courses.service';
import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { AdminCoursesResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-courses-response';
import { CourseStatus } from '../../../Core/Interfaces/Courses/course-status';
import { CourseDetailsToReturnDTO } from '../../../Core/Interfaces/Courses/course-details-to-return-dto';
import { CoursesParams } from '../../../Core/Interfaces/Courses/courses-params';
import { finalize } from 'rxjs';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { CourseType } from '../../../Core/Interfaces/Courses/course-type';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [
    TableModule,
    FormsModule,
    DropdownModule,
    TagModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './admin-courses.component.html',
  styleUrl: './admin-courses.component.scss',
})
export class AdminCoursesComponent implements OnInit {
  courses: AdminCoursesResponse[] = [];
  coursesParams: CoursesParams = new CoursesParams();
  courseStatus: SelectItem[] = [];
  totalCount: number = 0;
  first: number = 0;
  course: CourseDetailsToReturnDTO = {} as CourseDetailsToReturnDTO;
  courseType?: CourseType;
  status: CourseStatus = CourseStatus.PendingReview;
  isLoading: boolean = false;

  clonedCourses: { [s: string]: AdminCoursesResponse } = {};

  constructor(
    private readonly _adminManagementCoursesService: AdminManagementCoursesService,
    private readonly _router: Router,
    private readonly _notifications: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.courseStatus = [
      { label: 'Draft', value: CourseStatus.Draft },
      { label: 'Published', value: CourseStatus.Published },
      { label: 'Pending Review', value: CourseStatus.PendingReview },
      { label: 'Suspended', value: CourseStatus.Suspended },
    ];

    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this._adminManagementCoursesService
      .getCourses(this.coursesParams, this.courseType, this.status)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<Pagination<AdminCoursesResponse[]>>) => {
          if (res.succeed && res.data) {
            this.courses = res.data.data;
            this.totalCount = res.data.count;
            return;
          }

          this.resetCoursesResult();
        },
        error: () => this.resetCoursesResult(),
      });
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    const pageSize = event.rows ?? this.coursesParams.pageSize;
    const first = event.first ?? 0;
    const pageIndex = Math.floor(first / pageSize) + 1;

    this.first = first;
    this.coursesParams.pageIndex = pageIndex;
    this.coursesParams.pageSize = pageSize;
    this.loadCourses();
  }

  filterCoursesByStatus(status: CourseStatus): void {
    if (this.status === status || this.isLoading) {
      return;
    }

    this.status = status;
    this.first = 0;
    this.coursesParams.pageIndex = 1;
    this.loadCourses();
  }

  private resetCoursesResult(): void {
    this.courses = [];
    this.totalCount = 0;
  }

  getStatusLabel(status: CourseStatus | string): string {
    if (typeof status === 'number') {
      return (
        CourseStatus[status]?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? 'Unknown'
      );
    }

    const normalizedStatus = status.replace(/\s+/g, '').toLowerCase();
    const matchedStatus = this.courseStatus.find(
      (option) =>
        String(CourseStatus[option.value as CourseStatus]).toLowerCase() ===
        normalizedStatus,
    );

    return matchedStatus?.label ?? status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  onRowEditInit(course: AdminCoursesResponse) {
    this.clonedCourses[course.id] = { ...course };
  }

  onRowEditSave(course: AdminCoursesResponse) {
    const updateCourseStatusRequest: UpdateCourseStatusRequest = {
      status: course.status,
    };
    this._adminManagementCoursesService
      .updateCourseStatus(course.id, updateCourseStatusRequest)
      .subscribe({
        next: (res: ApplicationResult<boolean>) => {
          if (res.succeed) {
            this._notifications.showSuccess(
              'Course status updated successfully',
              'Update Course Status Succeeded',
            );
          }

          this.loadCourses();
        },
        error: () => {
          delete this.clonedCourses[course.id];
        },
      });
  }

  onRowEditCancel(course: AdminCoursesResponse, index: number) {
    this.courses[index] = this.clonedCourses[course.id];
    delete this.clonedCourses[course.id];
  }

  viewDetails(course: AdminCoursesResponse) {
    this._router.navigate([`/admin/course/${course.id}`], {
      queryParams: { type: course.type },
    });
  }

  getSeverity(status: CourseStatus | string) {
    switch (this.getStatusLabel(status)) {
      case 'Published':
        return 'success';
      case 'Draft':
        return 'info';
      case 'Pending Review':
        return 'warning';
      case 'Suspended':
        return 'danger';
      default:
        return 'info';
    }
  }
}
