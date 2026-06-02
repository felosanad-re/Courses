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
import { TooltipModule } from 'primeng/tooltip';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { CreateSectionRequest } from '../../../Core/Interfaces/Sections/create-section-request';
import { UpdateSectionRequest } from '../../../Core/Interfaces/Sections/update-section-request';
import { LectureWithSectionResponse } from '../../../Core/Interfaces/Lectures/lecture-with-section-response';
import { finalize } from 'rxjs';

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
    TooltipModule,
  ],
  templateUrl: './course-sections-details.component.html',
  styleUrl: './course-sections-details.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class CourseSectionsDetailsComponent implements OnInit {
  sections: SectionWithCourseResponse[] = [];
  selectedSections: SectionWithCourseResponse[] = [];
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
  courseId: number = 0;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _studentService: StudentService,
    private readonly _managementSectionService: ManagementSectionService,
    private readonly _managementLectureService: ManagementLectureService,
    private readonly _confirmationService: ConfirmationService,
    private readonly _notificationsService: NotificationsService,
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.courseId = +params['courseId'];
      this.newSection.courseId = this.courseId;
    });

    this.getAllSections();
  }

  // ─── Fetch Sections ───
  getAllSections(): void {
    this.isLoading = true;
    this._studentService.getSections(this.courseId).subscribe({
      next: (res) => {
        if (res.succeed && res.data) {
          this.sections = res.data;
        }
        this.isLoading = false;
      },
    });
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
  openEdit(section: SectionWithCourseResponse): void {
    this.editSectionData = {
      id: section.id,
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
  deleteSection(section: SectionWithCourseResponse): void {
    this._confirmationService.confirm({
      message: `Are you sure you want to delete "${section.title}"?`,
      header: 'Delete Section',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this._managementSectionService.deleteSection(section.id).subscribe({
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
        const ids = this.selectedSections.map((s) => s.id);
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
  deleteLecture(
    lecture: LectureWithSectionResponse,
    section: SectionWithCourseResponse,
  ): void {
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
  navigateToCreateLecture(sectionId: number): void {
    this._router.navigate(['/instructor/create-lecture', sectionId]);
  }

  navigateToUpdateLecture(sectionId: number, lectureId: number): void {
    this._router.navigate(['/instructor/update-lecture', sectionId, lectureId]);
  }

  // ─── Expand / Collapse ───
  expandAll(): void {
    this.expandedRows = this.sections.reduce<Record<number, boolean>>(
      (acc, s) => {
        acc[s.id] = true;
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
