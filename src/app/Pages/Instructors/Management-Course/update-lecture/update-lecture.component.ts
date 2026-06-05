import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ManagementLectureService } from '../../../../Core/Services/ManagementCourse/management-lecture.service';
import { UpdatedLectureRequest } from '../../../../Core/Interfaces/Lectures/updated-lecture-request';
import { ApplicationResult } from '../../../../Core/Interfaces/application-result';
import { LectureWithInstructorResponse } from '../../../../Core/Interfaces/Lectures/lecture-with-instructor-response';
import { NotificationsService } from '../../../../Core/Services/notifications.service';
import { ToastModule } from 'primeng/toast';
import { LectureFormComponent } from '../../../../Shared/Forms/lecture-form/lecture-form.component';
import {
  LectureFormData,
  LectureFormInitialData,
} from '../../../../Core/Interfaces/Lectures/lecture-form-data';

@Component({
  selector: 'app-update-lecture',
  standalone: true,
  imports: [CommonModule, ToastModule, RouterLink, LectureFormComponent],
  templateUrl: './update-lecture.component.html',
  styleUrl: './update-lecture.component.scss',
})
export class UpdateLectureComponent implements OnInit {
  courseId!: number;
  sectionId!: number;
  lectureId!: number;
  isSubmitting = false;
  isLoading = true;

  /** The lecture data used to pre-populate the shared form. */
  lectureData?: LectureFormInitialData;

  constructor(
    private readonly _managementLectureService: ManagementLectureService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _notifications: NotificationsService,
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.courseId = +params['courseId'];
      this.sectionId = +params['sectionId'];
      this.lectureId = +params['lectureId'];
    });

    // Fetch lecture data from the API
    this.loadLectureData();
  }

  /** Fetches the full lecture data from the API using the lectureId. */
  private loadLectureData(): void {
    this.isLoading = true;
    this._managementLectureService
      .getLecture(this.lectureId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<LectureWithInstructorResponse>) => {
          if (res.succeed && res.data) {
            this.lectureData = {
              title: res.data.title,
              videoUrl: res.data.videoUrl,
              order: res.data.order,
              durationInSeconds: res.data.durationInSeconds,
              isPreview: res.data.isPreview,
            };
            console.log(this.lectureData);
          } else {
            this._notifications.showError(
              res.message || 'Failed to load lecture data.',
              'Error',
            );
          }
        },
        error: () => {
          this._notifications.showError(
            'An unexpected error occurred while loading lecture data.',
            'Error',
          );
        },
      });
  }

  /** Handles the form data emitted by the shared lecture-form component. */
  onSubmit(formData: LectureFormData): void {
    this.isSubmitting = true;

    const data: UpdatedLectureRequest = {
      id: this.lectureId,
      title: formData.title,
      videoUrl: formData.videoUrl,
      order: formData.order,
      durationInSeconds: formData.durationInSeconds,
      isPreview: formData.isPreview,
      sectionId: this.sectionId,
    };

    this._managementLectureService
      .updateLecture(data)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: ApplicationResult<LectureWithInstructorResponse>) => {
          if (res.succeed && res.data) {
            this._notifications.showSuccess(
              res.message || 'Lecture updated successfully',
              'Update Lecture Succeeded',
            );
            this._router.navigate([
              '/instructor/course-sections-details',
              this.courseId,
            ]);
          } else {
            this._notifications.showError(
              res.message || 'Failed to update lecture.',
              'Update Lecture Failed',
            );
          }
        },
        error: () => {
          this._notifications.showError(
            'An unexpected error occurred. Please try again.',
            'Error',
          );
        },
      });
  }
}
