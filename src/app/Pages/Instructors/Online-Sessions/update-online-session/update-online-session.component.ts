import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ManagementOnlineService } from '../../../../Core/Services/ManagementOnlineCourses/management-online.service';
import { NotificationsService } from '../../../../Core/Services/notifications.service';
import { LiveSessionRequest } from '../../../../Core/Interfaces/LiveSessions/live-session-request';
import { ApplicationResult } from '../../../../Core/Interfaces/application-result';
import { LiveSessionResponse } from '../../../../Core/Interfaces/LiveSessions/live-session-response';
import { LiveSessionDetailsResponse } from '../../../../Core/Interfaces/LiveSessions/live-session-details-response';

@Component({
  selector: 'app-update-online-session',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    ToastModule,
  ],
  templateUrl: './update-online-session.component.html',
  styleUrl: './update-online-session.component.scss',
})
export class UpdateOnlineSessionComponent implements OnInit {
  courseId!: number;
  sectionId!: number;
  sessionId!: number;
  isLoading = false;
  isSubmitting = false;
  sessionForm!: FormGroup;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _managementOnlineService: ManagementOnlineService,
    private readonly _notifications: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.sessionForm = this._fb.group({
      topic: ['', [Validators.required, Validators.minLength(3)]],
      scheduledAt: ['', [Validators.required]],
      duration: [60, [Validators.required, Validators.min(1)]],
    });

    this._route.params.subscribe((params) => {
      this.courseId = +params['courseId'];
      this.sectionId = +params['sectionId'];
      this.sessionId = +params['sessionId'];
      this.loadSessionDetails();
    });
  }

  get backLink(): string {
    return `/instructor/course-sections-details/${this.courseId}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.sessionForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  loadSessionDetails(): void {
    if (!this.sessionId) return;

    this.isLoading = true;
    this._managementOnlineService
      .getSessionDetails(this.sessionId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<LiveSessionDetailsResponse>) => {
          if (!res.succeed || !res.data) {
            this._notifications.showError(
              res.message || 'Failed to load live session details.',
              'Load Session Failed',
            );
            return;
          }

          this.sectionId = res.data.sectionId || this.sectionId;
          this.sessionForm.patchValue({
            topic: res.data.topic,
            scheduledAt: this.toDateTimeLocalValue(res.data.scheduledAt),
            duration: res.data.durationMinutes,
          });
        },
      });
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const value = this.sessionForm.value;
    const data: LiveSessionRequest = {
      topic: value.topic,
      scheduledAt: `${value.scheduledAt}:00`,
      duration: value.duration,
      sectionId: this.sectionId,
    };

    this._managementOnlineService
      .updateSession(data, this.sessionId)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: ApplicationResult<LiveSessionResponse>) => {
          if (res.succeed) {
            this._notifications.showSuccess(
              res.message || 'Live session updated successfully',
              'Update Session Succeeded',
            );
            this._router.navigate([
              '/instructor/course-sections-details',
              this.courseId,
            ]);
            return;
          }

          this._notifications.showError(
            res.message || 'Failed to update live session.',
            'Update Session Failed',
          );
        },
      });
  }

  private toDateTimeLocalValue(value: Date | string): string {
    const date = new Date(value);
    const offsetMs = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
  }
}
