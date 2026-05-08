import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-instructor-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './instructor-footer.component.html',
  styleUrl: './instructor-footer.component.scss',
})
export class InstructorFooterComponent {
  currentYear = new Date().getFullYear();

  quickLinks = [
    { label: 'Dashboard', route: '/instructor/dashboard' },
    { label: 'My Courses', route: '/instructor/courses' },
    { label: 'Students', route: '/instructor/students' },
    { label: 'Analytics', route: '/instructor/analytics' },
  ];

  supportLinks = [
    { label: 'Help Center', route: '/instructor/help' },
    { label: 'Contact Us', route: '/instructor/contact' },
    { label: 'Terms of Service', route: '/terms' },
    { label: 'Privacy Policy', route: '/privacy' },
  ];
}