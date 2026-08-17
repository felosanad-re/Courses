import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-nav.component.html',
  styleUrl: './student-nav.component.scss',
})
export class StudentNavComponent {
  isMenuOpen = false;
  isAuthenticated = false;

  constructor(@Inject(PLATFORM_ID) private readonly _platformId: object) {
    this.isAuthenticated =
      isPlatformBrowser(this._platformId) &&
      Boolean(localStorage.getItem('token'));
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('roles');
      localStorage.removeItem('username');
      this.isAuthenticated = false;
    }
  }
}
