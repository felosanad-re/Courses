import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../../Core/Services/sidebar.service';

@Component({
  selector: 'app-instructor-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './instructor-nav.component.html',
  styleUrl: './instructor-nav.component.scss',
})
export class InstructorNavComponent {
  isSidebarOpen = true;
  isUserMenuOpen = false;
  isSidebarCollapsed = false;

  constructor(
    @Inject(PLATFORM_ID) private readonly _platformId: object,
    private sidebarService: SidebarService
  ) {}

  navItems = [
    { icon: 'pi-home', label: 'Dashboard', route: '/instructor/dashboard' },
    { icon: 'pi-book', label: 'My Courses', route: '/instructor/courses' },
    { icon: 'pi-video', label: 'Live Classes', route: '/instructor/live' },
    { icon: 'pi-users', label: 'Students', route: '/instructor/students' },
    { icon: 'pi-chart-line', label: 'Analytics', route: '/instructor/analytics' },
    { icon: 'pi-wallet', label: 'Earnings', route: '/instructor/earnings' },
    { icon: 'pi-cog', label: 'Settings', route: '/instructor/settings' },
  ];

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.removeItem('token');
    }
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 992) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidebarService.setCollapsed(this.isSidebarCollapsed);
  }
}