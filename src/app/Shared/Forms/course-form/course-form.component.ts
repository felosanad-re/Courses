import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CourseTypeToReturnDTO } from '../../../Core/Interfaces/courseTypes/course-type-to-return-dto';
import { CourseResponseForInstructor } from '../../../Core/Interfaces/Instructors/course-response-for-instructor';
import { CourseFormRequest } from '../../../Core/Interfaces/Instructors/CourseFormRequest';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, RouterLink],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.scss',
})
export class CourseFormComponent implements OnInit, OnChanges {
  // ─── Inputs ───────────────────────────────────────────────────────
  @Input({ required: true }) mode: 'Create New Course' | 'Update Course' =
    'Create New Course';

  /** Course types list – the parent fetches them and passes them in */
  @Input() courseTypes: CourseTypeToReturnDTO[] = [];

  /** Whether the parent is currently submitting the request */
  @Input() isSubmitting: boolean = false;

  /** Existing course data for Update mode (null for Create mode) */
  @Input() initialData: CourseResponseForInstructor | null = null;

  /** Router link for the breadcrumb "Dashboard" anchor */
  @Input() dashboardLink: string = '/instructor/dashboard';

  // ─── Outputs ──────────────────────────────────────────────────────
  /** Emits the aggregated form data when the user clicks Submit */
  @Output() formSubmit = new EventEmitter<CourseFormRequest>(); // Update - Create

  // ─── Internal State ───────────────────────────────────────────────
  courseForm!: FormGroup;
  currentStep = 1;
  totalSteps = 2;

  selectedImage: string | null = null;
  selectedFile: File | null = null;
  isUploading = false;

  /** Stores the original image URL from `initialData` (Update mode) */
  initialImageUrl: string | null = null;

  /** Flag: user explicitly removed the image (Update mode) */
  imageWasRemoved = false;

  constructor(private fb: FormBuilder) {}

  // ─── Lifecycle ────────────────────────────────────────────────────
  ngOnInit(): void {
    this.initForm();
    if (this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When initialData arrives asynchronously (Update mode), populate the form
    if (changes['initialData'] && changes['initialData'].currentValue) {
      this.populateForm(changes['initialData'].currentValue);
    }
  }

  // ─── Form Initialization ──────────────────────────────────────────
  initForm(): void {
    this.courseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      courseTypeId: [0, [Validators.required]],
      isPaid: [false],
      price: [0, [Validators.min(0)]],
    });
  }

  /** Patch existing course values into the form (Update mode) */
  populateForm(data: CourseResponseForInstructor): void {
    this.courseForm.patchValue({
      name: data.name,
      description: data.description,
      courseTypeId: data.courseTypeId,
      isPaid: data.isPaid,
      price: data.price,
    });
    this.selectedImage = data.image;
    this.initialImageUrl = data.image;
  }

  // ─── Image Handling ───────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }

      this.selectedFile = file;
      this.isUploading = true;
      this.imageWasRemoved = false;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
        this.isUploading = false;
      };
      reader.onerror = () => {
        this.isUploading = false;
        this.selectedFile = null;
        alert('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.selectedFile = null;
    this.initialImageUrl = null;
    this.imageWasRemoved = true;
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // ─── Step Navigation ──────────────────────────────────────────────
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

  // ─── Validation ───────────────────────────────────────────────────
  isFieldInvalid(fieldName: string): boolean {
    const field = this.courseForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  // ─── Form Submission ──────────────────────────────────────────────
  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.formSubmit.emit({
      name: this.courseForm.get('name')?.value,
      description: this.courseForm.get('description')?.value,
      courseTypeId: this.courseForm.get('courseTypeId')?.value || 0,
      isPaid: this.courseForm.get('isPaid')?.value || false,
      price: this.courseForm.get('price')?.value || 0,
      image: this.selectedFile || null,
      imageUrl: this.imageWasRemoved
        ? null
        : this.selectedFile
          ? null
          : this.initialImageUrl,
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────
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

  getSubtitle(): string {
    return this.mode === 'Create New Course'
      ? 'Fill in the details to create your new course'
      : 'Update your course details';
  }

  getSubmitButtonText(): string {
    return this.mode === 'Create New Course'
      ? 'Create Course'
      : 'Update Course';
  }

  getSubmittingButtonText(): string {
    return this.mode === 'Create New Course' ? 'Creating...' : 'Updating...';
  }
}
