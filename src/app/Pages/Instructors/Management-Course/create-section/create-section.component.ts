import { Component, OnInit } from '@angular/core';
import { CreateSectionRequest } from '../../../../Core/Interfaces/Sections/create-section-request';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ManagementSectionService } from '../../../../Core/Services/ManagementCourse/management-section.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { SectionWithCourseResponse } from '../../../../Core/Interfaces/Courses/section-with-course-response';
import { ApplicationResult } from '../../../../Core/Interfaces/application-result';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-create-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    MessageModule,
    ToastModule,
    RouterLink,
  ],
  providers: [MessageService],
  templateUrl: './create-section.component.html',
  styleUrl: './create-section.component.scss',
})
export class CreateSectionComponent implements OnInit {
  courseId!: number;
  isSubmitting: boolean = false;
  createSectionForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly _managementSectionServices: ManagementSectionService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Get Course Id From Route
    this._route.params.subscribe((params) => {
      this.courseId = +params['courseId'];
    });

    this.initForm();
  }

  initForm(): void {
    this.createSectionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      order: [1, [Validators.required, Validators.min(1)]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createSectionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.createSectionForm.invalid) {
      this.createSectionForm.markAllAsTouched();
      this._messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly.',
      });
      return;
    }

    this.isSubmitting = true;

    const data: CreateSectionRequest = {
      title: this.createSectionForm.get('title')?.value,
      order: Number(this.createSectionForm.get('order')?.value),
      courseId: this.courseId,
    };

    this._managementSectionServices
      .createSection(data)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: ApplicationResult<SectionWithCourseResponse>) => {
          if (res.succeed && res.data) {
            this._messageService.add({
              severity: 'success',
              summary: 'Section Created',
              detail: `Section "${res.data.title}" has been created successfully!`,
            });
            this._router.navigate([
              '/instructor/course-sections-details',
              res.data.id,
            ]);
          } else {
            this._messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: res.message || 'Failed to create section.',
            });
          }
        },
      });
  }
}
