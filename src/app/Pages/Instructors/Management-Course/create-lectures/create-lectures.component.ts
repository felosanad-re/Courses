import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ManagementLectureService } from '../../../../Core/Services/ManagementCourse/management-lecture.service';
import { CreatedLectureRequest } from '../../../../Core/Interfaces/Lectures/created-lecture-request';
import { ApplicationResult } from '../../../../Core/Interfaces/application-result';
import { LectureWithInstructorResponse } from '../../../../Core/Interfaces/Lectures/lecture-with-instructor-response';
import { NotificationsService } from '../../../../Core/Services/notifications.service';
import { ToastModule } from 'primeng/toast';
import { LectureFormComponent } from '../../../../Shared/Forms/lecture-form/lecture-form.component';
import { LectureFormData } from '../../../../Core/Interfaces/Lectures/lecture-form-data';

@Component({
  selector: 'app-create-lectures',
  standalone: true,
  imports: [CommonModule, ToastModule, RouterLink, LectureFormComponent],
  templateUrl: './create-lectures.component.html',
  styleUrl: './create-lectures.component.scss',
})
export class CreateLecturesComponent implements OnInit {
  courseId!: number;
  sectionId!: number;
  isSubmitting = false;

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
    });
  }

  /** Handles the form data emitted by the shared lecture-form component. */
  onSubmit(formData: LectureFormData): void {
    this.isSubmitting = true;

    const data: CreatedLectureRequest = {
      title: formData.title,
      videoUrl: formData.videoUrl,
      order: formData.order,
      durationInSeconds: formData.durationInSeconds,
      isPreview: formData.isPreview,
      sectionId: this.sectionId,
    };

    this._managementLectureService
      .createLecture(data)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: ApplicationResult<LectureWithInstructorResponse>) => {
          if (res.succeed && res.data) {
            this._notifications.showSuccess(
              res.message || 'Lecture created successfully',
              'Create Lecture Succeeded',
            );
            this._router.navigate([
              '/instructor/course-sections-details',
              this.courseId,
            ]);
          } else {
            this._notifications.showError(
              res.message || 'Failed to create lecture.',
              'Create Lecture Failed',
            );
          }
        },
      });
  }
}
