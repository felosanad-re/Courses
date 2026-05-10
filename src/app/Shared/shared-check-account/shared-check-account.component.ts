import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface CheckAccountFormData {
  userNameOrEmail: string;
}

export type CheckAccountApiMethod = (
  data: CheckAccountFormData,
) => import('rxjs').Observable<any>;

@Component({
  selector: 'app-shared-check-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './shared-check-account.component.html',
  styleUrl: './shared-check-account.component.scss',
})
export class SharedCheckAccountComponent {
  @Input() pageTitle = 'Check Account';
  @Input() pageSubtitle = 'Find out if you already have an account';
  @Input() buttonText = 'Check Account';
  @Input() fieldName = 'userNameOrEmail';
  @Input() isSubmitting = false;

  @Output() formSubmitted = new EventEmitter<{ [key: string]: string }>();

  checkAccountForm: FormGroup;

  constructor(private readonly _fb: FormBuilder) {
    this.checkAccountForm = this._fb.group({
      userNameOrEmail: ['', [Validators.required]],
    });
  }

  get userNameOrEmail() {
    return this.checkAccountForm.get('userNameOrEmail');
  }

  onSubmit(): void {
    if (this.checkAccountForm.invalid) {
      this.checkAccountForm.markAllAsTouched();
      return;
    }

    const rawValue = this.checkAccountForm.value;
    const data: { [key: string]: string } = {};
    data[this.fieldName] = rawValue.userNameOrEmail;
    this.formSubmitted.emit(data);
  }
}
