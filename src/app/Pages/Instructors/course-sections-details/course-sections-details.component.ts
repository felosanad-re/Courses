import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../Core/Services/Student/student.service';
import { SectionWithCourseResponse } from '../../../Core/Interfaces/Courses/section-with-course-response';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { ManagementSectionService } from '../../../Core/Services/ManagementCourse/management-section.service';
import { ManagementLectureService } from '../../../Core/Services/ManagementCourse/management-lecture.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { CreateSectionRequest } from '../../../Core/Interfaces/Sections/create-section-request';
import { UpdateSectionRequest } from '../../../Core/Interfaces/Sections/update-section-request';
import { LectureWithSectionResponse } from '../../../Core/Interfaces/Lectures/lecture-with-section-response';
import { Observable, finalize } from 'rxjs';
import { CourseType } from '../../../Core/Interfaces/Courses/course-type';
import { ManagementCourseService } from '../../../Core/Services/ManagementCourse/management-course.service';
import { ManagementOnlineService } from '../../../Core/Services/ManagementOnlineCourses/management-online.service';
import { SectionWithSessionsResponse } from '../../../Core/Interfaces/LiveSessions/section-with-sessions-response';
import { SessionsWithSectionResponse } from '../../../Core/Interfaces/LiveSessions/sessions-with-section-response';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseResponseForSubmit } from '../../../Core/Interfaces/Courses/course-response-for-submit';

type CourseContentMode = 'recorded' | 'online';

// Course type to show if is recorder -> SectionWithCourseResponse
// Course type to show if is online -> SectionWithSessionsResponse
type CourseSection = SectionWithCourseResponse | SectionWithSessionsResponse;

@Component({
  selector: 'app-course-sections-details',
  standalone: true,
  imports: [
    TableModule,
    ToastModule,
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    DialogModule,
    FormsModule,
    InputNumberModule,
    InputTextModule,
    TooltipModule,
  ],
  templateUrl: './course-sections-details.component.html',
  styleUrl: './course-sections-details.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class CourseSectionsDetailsComponent implements OnInit {
  sections: CourseSection[] = [];
  selectedSections: CourseSection[] = [];
  expandedRows: Record<number, boolean> = {};

  // Create dialog
  createDialogVisible: boolean = false;
  newSection: CreateSectionRequest = { title: '', order: 1, courseId: 0 };
  isCreating: boolean = false;

  // Edit dialog
  editDialogVisible: boolean = false;
  editSectionData: UpdateSectionRequest = { id: 0, title: '', order: 1 };
  isUpdating: boolean = false;

  // General
  isSubmitted: boolean = false;
  isLoading: boolean = false;
  isSubmittingReview: boolean = false;
  courseId: number = 0;
  contentMode: CourseContentMode = 'recorded';
  courseTypes: string = CourseType.RecorderCourse;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _studentService: StudentService,
    private readonly _managementSectionService: ManagementSectionService,
    private readonly _managementLectureService: ManagementLectureService,
    private readonly _managementCourseService: ManagementCourseService,
    private readonly _managementOnlineService: ManagementOnlineService,
    private readonly _confirmationService: ConfirmationService,
    private readonly _notificationsService: NotificationsService,
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.courseId = +params['courseId'];
      this.newSection.courseId = this.courseId;
      this.loadCourseMode();
    });
  }

  // ─── Course Mode ───
  loadCourseMode(): void {
    this.isLoading = true;
    this._managementCourseService.getCourseDetails(this.courseId).subscribe({
      next: (res) => {
        if (res.succeed && res.data) {
          this.courseTypes = res.data.type;
          this.contentMode = this.isOnlineCourse(res.data.type)
            ? 'online'
            : 'recorded';
        }
        this.getAllSections();
      },
      error: () => {
        this.contentMode = 'recorded';
        this.getAllSections();
      },
    });
  }

  isOnlineCourse(status: string): boolean {
    const normalizedStatus = String(status ?? '')
      .replace(/\s+/g, '')
      .toLowerCase();
    return (
      normalizedStatus === CourseType.OnlineCourse.toLowerCase() ||
      normalizedStatus === '0'
    );
  }

  get isOnlineMode(): boolean {
    return this.contentMode === 'online';
  }

  get contentLabel(): string {
    return this.isOnlineMode ? 'Live Sessions' : 'Lectures';
  }

  get contentItemLabel(): string {
    return this.isOnlineMode ? 'Live Session' : 'Lecture';
  }

  get contentIcon(): string {
    return this.isOnlineMode ? 'pi pi-video' : 'pi pi-play-circle';
  }

  // ─── Fetch Sections ───
  getAllSections(): void {
    this.isLoading = true;
    const request$: Observable<ApplicationResult<CourseSection[]>> = this
      .isOnlineMode
      ? (this._managementOnlineService.getSectionsWithSessions(
          this.courseId,
        ) as Observable<ApplicationResult<CourseSection[]>>)
      : (this._studentService.getSections(this.courseId) as Observable<
          ApplicationResult<CourseSection[]>
        >);

    request$.subscribe({
      next: (res) => {
        if (res.succeed && res.data) {
          this.sections = this.normalizeSections(res.data as CourseSection[]);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private normalizeSections(sections: CourseSection[]): CourseSection[] {
    return sections.map((section) => ({
      ...section,
      id: this.getSectionId(section),
      lectures: this.isOnlineMode
        ? []
        : (section as SectionWithCourseResponse).lectures,
      sessions: this.isOnlineMode
        ? (section as SectionWithSessionsResponse).sessions || []
        : [],
    }));
  }

  getSectionId(section: CourseSection): number {
    return section.id;
  }

  getContentCount(section: CourseSection): number {
    return this.isOnlineMode
      ? ((section as SectionWithSessionsResponse).sessions?.length ?? 0)
      : ((section as SectionWithCourseResponse).lectures?.length ?? 0);
  }

  getLectures(section: CourseSection): LectureWithSectionResponse[] {
    return (section as SectionWithCourseResponse).lectures || [];
  }

  getSessions(section: CourseSection): SessionsWithSectionResponse[] {
    return (section as SectionWithSessionsResponse).sessions || [];
  }

  formatDate(value: Date | string): string {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  }

  // ─── Create Section ───
  openNew(): void {
    this.newSection = { title: '', order: 1, courseId: this.courseId };
    this.isSubmitted = false;
    this.createDialogVisible = true;
  }

  hideCreateDialog(): void {
    this.isSubmitted = false;
    this.createDialogVisible = false;
  }

  createSection(): void {
    this.isSubmitted = true;

    if (!this.newSection.title || !this.newSection.order) {
      return;
    }

    this.isCreating = true;
    this._managementSectionService
      .createSection(this.newSection)
      .pipe(finalize(() => (this.isCreating = false)))
      .subscribe({
        next: (res) => {
          if (res.succeed) {
            this._notificationsService.showSuccess(
              'Section created successfully',
              'Success',
            );
            this.getAllSections();
            this.hideCreateDialog();
          } else {
            this._notificationsService.showError(
              res.message || 'Failed to create section',
              'Error',
            );
          }
          this.isCreating = false;
        },
      });
  }

  // ─── Edit Section ───
  openEdit(section: CourseSection): void {
    this.editSectionData = {
      id: this.getSectionId(section),
      title: section.title,
      order: section.order,
    };
    this.isSubmitted = false;
    this.editDialogVisible = true;
  }

  hideEditDialog(): void {
    this.isSubmitted = false;
    this.editDialogVisible = false;
  }

  updateSection(): void {
    this.isSubmitted = true;

    if (!this.editSectionData.title || !this.editSectionData.order) {
      return;
    }

    this.isUpdating = true;
    this._managementSectionService
      .updateSection(this.editSectionData)
      .pipe(finalize(() => (this.isUpdating = false)))
      .subscribe({
        next: (res) => {
          if (res.succeed) {
            this._notificationsService.showSuccess(
              'Section updated successfully',
              'Success',
            );
            this.getAllSections();
            this.hideEditDialog();
          } else {
            this._notificationsService.showError(
              res.message || 'Failed to update section',
              'Error',
            );
          }
          this.isUpdating = false;
        },
      });
  }

  // ─── Delete Section ───
  deleteSection(section: CourseSection): void {
    this._confirmationService.confirm({
      message: `Are you sure you want to delete "${section.title}"?`,
      header: 'Delete Section',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this._managementSectionService
          .deleteSection(this.getSectionId(section))
          .subscribe({
            next: (res) => {
              if (res.succeed) {
                this._notificationsService.showSuccess(
                  'Section deleted successfully',
                  'Success',
                );
                this.getAllSections();
              } else {
                this._notificationsService.showError(
                  res.message || 'Failed to delete section',
                  'Error',
                );
              }
            },
          });
      },
    });
  }

  // ─── Delete Selected Sections ───
  deleteSelectedSections(): void {
    this._confirmationService.confirm({
      message: `Are you sure you want to delete the selected ${this.selectedSections.length} sections?`,
      header: 'Delete Selected Sections',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        const ids = this.selectedSections.map((s) => this.getSectionId(s));
        this._managementSectionService.deleteSections(ids).subscribe({
          next: (res) => {
            if (res.succeed) {
              this._notificationsService.showSuccess(
                'Selected sections deleted successfully',
                'Success',
              );
              this.selectedSections = [];
              this.getAllSections();
            } else {
              this._notificationsService.showError(
                res.message || 'Failed to delete selected sections',
                'Error',
              );
            }
          },
        });
      },
    });
  }

  // ─── Delete Lecture ───
  deleteLecture(lecture: LectureWithSectionResponse): void {
    this._confirmationService.confirm({
      message: `Are you sure you want to delete "${lecture.title}"?`,
      header: 'Delete Lecture',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this._managementLectureService.deleteLecture(lecture.id).subscribe({
          next: (res) => {
            if (res.succeed) {
              this._notificationsService.showSuccess(
                'Lecture deleted successfully',
                'Success',
              );
              this.getAllSections();
            } else {
              this._notificationsService.showError(
                res.message || 'Failed to delete lecture',
                'Error',
              );
            }
          },
        });
      },
    });
  }

  // ─── Navigation ───
  navigateToCreateContent(sectionId: number): void {
    if (this.isOnlineMode) {
      this._router.navigate([
        '/instructor/online-sessions/create',
        this.courseId,
        sectionId,
      ]);
      return;
    }

    this._router.navigate([
      '/instructor/create-lecture',
      this.courseId,
      sectionId,
    ]);
  }

  navigateToUpdateLecture(sectionId: number, lectureId: number): void {
    this._router.navigate([
      '/instructor/update-lecture',
      this.courseId,
      sectionId,
      lectureId,
    ]);
  }

  navigateToUpdateSession(sectionId: number, sessionId: number): void {
    this._router.navigate([
      '/instructor/online-sessions/update',
      this.courseId,
      sectionId,
      sessionId,
    ]);
  }

  deleteSession(session: SessionsWithSectionResponse): void {
    this._confirmationService.confirm({
      message: `Are you sure you want to delete "${session.topic}"?`,
      header: 'Delete Live Session',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this._managementOnlineService.deleteSession(session.id).subscribe({
          next: (res) => {
            if (res.succeed) {
              this._notificationsService.showSuccess(
                res.message || 'Live session deleted successfully',
                'Success',
              );
              this.getAllSections();
              return;
            }

            this._notificationsService.showError(
              res.message || 'Failed to delete live session',
              'Error',
            );
          },
        });
      },
    });
  }

  submitCourseForReview(): void {
    this.isSubmittingReview = true;
    this._managementCourseService
      .submitCourseForReview(this.courseId)
      .pipe(finalize(() => (this.isSubmittingReview = false)))
      .subscribe({
        next: (res: ApplicationResult<CourseResponseForSubmit>) => {
          if (res.succeed && res.data) {
            this._notificationsService.showSuccess(
              'Course submitted for review successfully',
              'Success',
            );
          } else {
            this._notificationsService.showError(
              res.message || 'Failed to submit course for review',
              'Error',
            );
          }
        },
      });
  }

  // ─── Expand / Collapse ───
  expandAll(): void {
    this.expandedRows = this.sections.reduce<Record<number, boolean>>(
      (acc, s) => {
        acc[this.getSectionId(s)] = true;
        return acc;
      },
      {},
    );
  }

  collapseAll(): void {
    this.expandedRows = {};
  }

  onRowExpand(_event: TableRowExpandEvent): void {}

  onRowCollapse(_event: TableRowCollapseEvent): void {}
}
