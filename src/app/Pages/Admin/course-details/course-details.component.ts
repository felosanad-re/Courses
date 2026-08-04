import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseDetailsToReturnDTO } from '../../../Core/Interfaces/Courses/course-details-to-return-dto';
import { CourseStatus } from '../../../Core/Interfaces/Courses/course-status';
import { CourseType } from '../../../Core/Interfaces/Courses/course-type';
import { CourseContentItemDTO } from '../../../Core/Interfaces/Lectures/CourseContentItemDTO';
import { SessionsWithSectionResponse } from '../../../Core/Interfaces/LiveSessions/sessions-with-section-response';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { AdminManagementCoursesService } from './../../../Core/Services/Admin/admin-management-courses.service';

type CourseContentDisplayItem =
  | CourseContentItemDTO
  | SessionsWithSectionResponse;

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DividerModule,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss',
  providers: [ConfirmationService],
})
export class CourseDetailsComponent implements OnInit {
  constructor(
    private readonly _adminManagementCoursesService: AdminManagementCoursesService,
    private readonly _Route: ActivatedRoute,
    private readonly _notifications: NotificationsService,
    private readonly _confirmationService: ConfirmationService,
  ) {}
  courseId!: number;
  courseType!: CourseType;
  course: CourseDetailsToReturnDTO = {} as CourseDetailsToReturnDTO;
  isLoading = false;
  position = 'center';

  // Calculates the total number of lectures and live sessions in all sections.
  get totalContentItems(): number {
    return (
      this.course.sections?.reduce(
        (total, section) => total + (section.content?.length ?? 0),
        0,
      ) ?? 0
    );
  }

  // Reads the course ID and type from the URL, then loads the course details.
  ngOnInit(): void {
    this.courseId = this._Route.snapshot.params['courseId'];
    this._Route.queryParams.subscribe((params) => {
      this.courseType = params['type'];
    });

    this.getCourseDetails();
  }

  // Fetches the course details and keeps the loading state active until completion.
  getCourseDetails(): void {
    this.isLoading = true;
    this._adminManagementCoursesService
      .getCourseDetails(this.courseId, this.courseType)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<CourseDetailsToReturnDTO>) => {
          if (res.succeed && res.data) {
            this.course = res.data;
          }
        },
      });
  }

  // Treats API section content as display items that may be lectures or live sessions.
  getContentItems(content: CourseContentItemDTO[]): CourseContentDisplayItem[] {
    return content as CourseContentDisplayItem[];
  }

  // Type guard: identifies a live session by fields that only sessions contain.
  isLiveSession(
    item: CourseContentDisplayItem,
  ): item is SessionsWithSectionResponse {
    return 'topic' in item || 'scheduledAt' in item;
  }

  // Returns the correct display title for either a lecture or a live session.
  getItemTitle(item: CourseContentDisplayItem): string {
    return this.isLiveSession(item) ? item.topic : item.title;
  }

  // Converts a numeric or camel-case course status into a readable label.
  getCourseStatusLabel(): string {
    if (typeof this.course.status === 'number') {
      return CourseStatus[this.course.status] ?? 'Unknown';
    }

    return this.course.status?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Unknown';
  }

  // Maps the course status to the matching PrimeNG Tag severity and color.
  getCourseStatusSeverity(): 'success' | 'info' | 'warning' | 'danger' {
    switch (this.getCourseStatusLabel().replace(/\s+/g, '').toLowerCase()) {
      case 'published':
        return 'success';
      case 'pendingreview':
        return 'warning';
      case 'suspended':
        return 'danger';
      default:
        return 'info';
    }
  }

  // Maps the live-session status to the matching PrimeNG Tag severity and color.
  getSessionStatusSeverity(
    status: string,
  ): 'success' | 'info' | 'warning' | 'danger' {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'cancelled':
      case 'canceled':
        return 'danger';
      case 'scheduled':
        return 'warning';
      default:
        return 'info';
    }
  }

  // Opens the delete confirmation dialog and deletes only after admin approval.
  confirmPosition(position: string): void {
    this.position = position;

    this._confirmationService.confirm({
      message:
        'This course and its related content will be permanently deleted. This action cannot be undone.',
      header: 'Delete course',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      rejectButtonStyleClass: 'p-button-text delete-confirm-dialog__cancel',
      acceptButtonStyleClass: 'p-button-danger delete-confirm-dialog__accept',
      accept: () => {
        this.deleteCourse(this.courseId);
      },
      key: 'positionDialog',
    });
  }

  // Sends the delete request and displays a success notification when completed.
  deleteCourse(courseId: number): void {
    this._adminManagementCoursesService
      .deleteCourse(courseId)
      .subscribe((res) => {
        if (res.succeed) {
          this._notifications.showSuccess(
            'Course deleted successfully',
            'Success',
          );
          // this._Route.navigate(['/admin/courses']);
        }
      });
  }
}
