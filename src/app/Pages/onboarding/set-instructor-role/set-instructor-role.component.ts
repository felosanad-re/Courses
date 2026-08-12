import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InstructorRequestService } from '../../../Core/Services/InstructorsRequest/instructor-request.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { ApplyInstructorResponse } from '../../../Core/Interfaces/InstructorsRequest/apply-instructor-response';
import { finalize } from 'rxjs';
import { NotificationsService } from '../../../Core/Services/notifications.service';

@Component({
  selector: 'app-set-instructor-role',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-instructor-role.component.html',
  styleUrl: './set-instructor-role.component.scss',
})
export class SetInstructorRoleComponent {
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  instructorForm: FormGroup;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _instructorService: InstructorRequestService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
  ) {
    this.instructorForm = this._fb.group({
      bio: ['', [Validators.required, Validators.maxLength(500)]],
      specialty: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      experienceYears: [
        '',
        [Validators.required, Validators.min(1), Validators.max(50)],
      ],
    });
  }

  get bio() {
    return this.instructorForm.get('bio');
  }
  get specialty() {
    return this.instructorForm.get('specialty');
  }
  get experienceYears() {
    return this.instructorForm.get('experienceYears');
  }

  onSubmit() {
    if (this.instructorForm.invalid) {
      this.instructorForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this._instructorService
      .applyRequest(this.instructorForm.value)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response: ApplicationResult<ApplyInstructorResponse>) => {
          this.isSubmitting.set(false);
          if (response.succeed) {
            // Redirect to home after successful request
            this._router.navigate(['/']);
            this._notifications.showSuccess(
              response.message || 'Your request has been submitted',
              'Success',
            );
          }
        },
      });
  }
}
