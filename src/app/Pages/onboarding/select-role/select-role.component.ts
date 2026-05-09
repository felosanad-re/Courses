import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface RoleOption {
  value: 'student' | 'instructor';
  title: string;
  description: string;
  icon: string;
  features: string[];
}

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-role.component.html',
  styleUrl: './select-role.component.scss',
})
export class SelectRoleComponent {
  selectedRole = signal<'student' | 'instructor' | null>(null);
  isSubmitting = signal(false);

  roles: RoleOption[] = [
    {
      value: 'student',
      title: 'Student',
      description: 'Learn new skills and grow your knowledge',
      icon: 'pi-book',
      features: [
        'Access thousands of courses',
        'Track your learning progress',
        'Get certificates',
        'Join interactive lessons',
      ],
    },
    {
      value: 'instructor',
      title: 'Instructor',
      description: 'Share your knowledge and teach others',
      icon: 'pi-briefcase',
      features: [
        'Create and sell courses',
        'Manage your students',
        'Track earnings',
        'Build your teaching brand',
      ],
    },
  ];

  constructor(private readonly _router: Router) {}

  selectRole(role: 'student' | 'instructor') {
    this.selectedRole.set(role);
  }

  onSubmit() {
    if (!this.selectedRole()) return;

    this.isSubmitting.set(true);

    setTimeout(() => {
      const role = this.selectedRole();

      if (role === 'student') {
        this._router.navigate(['/student/home']);
      } else if (role === 'instructor') {
        this._router.navigate(['/set-instructor-role']);
      }

      this.isSubmitting.set(false);
    }, 500);
  }
}
