import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EditProfileRequest } from '../../Core/Interfaces/Profiles/edit-profile-request';
import { UserProfileResponse } from '../../Core/Interfaces/Profiles/user-profile-response';

@Component({
  selector: 'app-profile-page-shared',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SkeletonModule],
  templateUrl: './profile-page-shared.component.html',
  styleUrl: './profile-page-shared.component.scss',
})
export class ProfilePageSharedComponent implements OnChanges {
  @Input({ required: true }) data: UserProfileResponse =
    {} as UserProfileResponse;
  @Input() isLoading = false;
  @Input() isSaving = false;

  @Output() onEditProfile = new EventEmitter<EditProfileRequest>();

  isEditing = false;

  readonly profileForm = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    phoneNumber: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[+]?[0-9\s()-]{7,20}$/),
      ],
    }),
    birthday: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange && this.isEditing) {
      this.isEditing = false;
      this.profileForm.reset();
    }
  }

  startEditing(): void {
    this.profileForm.reset({
      firstName: this.data.firstName ?? '',
      lastName: this.data.lastName ?? '',
      address: this.data.address ?? '',
      phoneNumber: this.data.phoneNumber ?? '',
      birthday: this.toDateInputValue(this.data.birthday),
    });
    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.profileForm.reset();
  }

  submitEdit(): void {
    if (this.profileForm.invalid || this.isSaving) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValue = this.profileForm.getRawValue();
    const request: EditProfileRequest = {
      ...formValue,
      birthday: new Date(`${formValue.birthday}T00:00:00`),
    };
    this.onEditProfile.emit(request);
  }

  get isInstructor(): boolean {
    return (
      this.data.userRoles?.some(
        (role) => role.toLowerCase() === 'instructor' || 'admin',
      ) ?? false
    );
  }

  get displayName(): string {
    return `${this.data.firstName ?? ''} ${this.data.lastName ?? ''}`.trim();
  }

  get maxBirthday(): string {
    return this.toDateInputValue(new Date());
  }

  get initials(): string {
    return this.displayName
      .split(' ')
      .filter(Boolean)
      .map((name) => name.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  private toDateInputValue(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
