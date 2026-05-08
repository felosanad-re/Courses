import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { InstructorsService } from '../../../Core/Services/Instructors/instructors.service';
import { CreatedCourseRequest } from '../../../Core/Interfaces/Instructors/created-course-request';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseResponseForInstructor } from '../../../Core/Interfaces/Instructors/course-response-for-instructor';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.scss',
})
export class CreateCourseComponent implements OnInit {
  courseForm!: FormGroup;
  isSubmitting = false;
  currentStep = 1;
  totalSteps = 2;

  selectedImage: string | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private instructorsService: InstructorsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.courseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      image: [''],
      isPaid: [false],
      price: [0, [Validators.min(0)]],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      this.isUploading = true;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
        this.courseForm.patchValue({ image: this.selectedImage });
        this.isUploading = false;
      };
      reader.onerror = () => {
        this.isUploading = false;
        alert('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.courseForm.patchValue({ image: '' });
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: {
        const name = this.courseForm.get('name')?.valid ?? false;
        const desc = this.courseForm.get('description')?.valid ?? false;
        return name && desc;
      }
      case 2: {
        return true;
      }
      default:
        return false;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.courseForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const courseData: CreatedCourseRequest = {
      name: this.courseForm.get('name')?.value,
      description: this.courseForm.get('description')?.value,
      image: this.courseForm.get('image')?.value || '',
      isPaid: this.courseForm.get('isPaid')?.value || false,
      price: this.courseForm.get('price')?.value || 0,
    };

    this.instructorsService.addCourse(courseData).subscribe({
      next: (response: ApplicationResult<CourseResponseForInstructor>) => {
        if (response.succeeded) {
          this.router.navigate(['/instructor/dashboard']);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating course:', error);
        this.isSubmitting = false;
      },
    });
  }

  getStepTitle(step: number): string {
    switch (step) {
      case 1:
        return 'Basic Info';
      case 2:
        return 'Pricing';
      default:
        return '';
    }
  }
}