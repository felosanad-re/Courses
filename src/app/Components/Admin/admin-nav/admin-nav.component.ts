import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from '../../../Core/Services/sidebar.service';
import {
  SidebarComponent,
  NavItem,
} from '../../../Shared/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.scss',
})
export class AdminNavComponent implements OnInit {
  isSidebarOpen = true;

  isSidebarCollapsed = false;

  isUserMenuOpen = false;

  userName!: string;

  userRole = 'Administrator';

  navItems: NavItem[] = [
    { icon: 'pi-home', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: 'pi-book', label: 'Courses', route: '/admin/courses' },
    { icon: 'pi-users', label: 'Students', route: '/admin/students' },
    { icon: 'pi-user-plus', label: 'Instructors', route: '/admin/instructors' },
    { icon: 'pi-comments', label: 'Reviews', route: '/admin/reviews' },
    { icon: 'pi-cog', label: 'Settings', route: '/admin/settings' },
  ];

  constructor(
    private readonly _router: Router,
    @Inject(PLATFORM_ID) private readonly _platformId: object,
    private sidebarService: SidebarService,
  ) {}

  ngOnInit(): void {
    this.loadUserName();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidebarService.setCollapsed(this.isSidebarCollapsed);
  }

  closeSidebarOnMobile(): void {
    if (isPlatformBrowser(this._platformId) && window.innerWidth < 992) {
      this.isSidebarOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  loadUserName(): void {
    if (isPlatformBrowser(this._platformId)) {
      const adminName = localStorage.getItem('username');
      this.userName = adminName || 'Admin';
    }
  }

  logout(): void {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('roles');
      this._router.navigate(['/login']);
    }
  }
}
