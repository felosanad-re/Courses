import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from '../../../Core/Services/sidebar.service';
import {
  SidebarComponent,
  NavItem,
} from '../../../Shared/sidebar/sidebar.component';

/**
 * InstructorNavComponent - Top navbar + sidebar wrapper for the Instructor role
 *
 * This component owns the sidebar state (isSidebarOpen, isSidebarCollapsed)
 * and passes it down to the SidebarComponent via Input bindings.
 * SidebarComponent emits Output events back here for state changes.
 *
 * The SidebarService is used to sync the collapsed state with the layout
 * so the main content area adjusts its margin accordingly.
 */
@Component({
  selector: 'app-instructor-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './instructor-nav.component.html',
  styleUrl: './instructor-nav.component.scss',
})
export class InstructorNavComponent {
  // ─── Sidebar State ───
  // These are managed HERE and passed to <app-sidebar> via Input bindings

  /** Whether the sidebar is open/visible */
  isSidebarOpen = true;

  /** Whether the sidebar is in collapsed (icon-only) mode */
  isSidebarCollapsed = false;

  // ─── Navbar State ───

  /** Whether the user dropdown menu is open */
  isUserMenuOpen = false;

  /** User display name - loaded from localStorage on init */
  userName!: string;

  /** User role label - displayed in the sidebar header */
  userRole = 'Instructor';

  // ─── Navigation Items ───
  // Instructor-specific nav items passed to <app-sidebar> via [navItems]
  navItems: NavItem[] = [
    { icon: 'pi-home', label: 'Dashboard', route: '/instructor/dashboard' },
    { icon: 'pi-book', label: 'My Courses', route: '/instructor/courses' },
    { icon: 'pi-video', label: 'Live Classes', route: '/instructor/live' },
    { icon: 'pi-users', label: 'Students', route: '/instructor/students' },
    {
      icon: 'pi-chart-line',
      label: 'Analytics',
      route: '/instructor/analytics',
    },
    { icon: 'pi-wallet', label: 'Earnings', route: '/instructor/earnings' },
    { icon: 'pi-cog', label: 'Settings', route: '/instructor/settings' },
  ];

  constructor(
    private readonly _router: Router,
    @Inject(PLATFORM_ID) private readonly _platformId: object,
    private sidebarService: SidebarService,
  ) {}

  ngOnInit(): void {
    this.loadUserName();
  }

  // ─── Sidebar Event Handlers ───
  // These handle Output events emitted by <app-sidebar>

  /** Toggles sidebar open/close - triggered by navbar menu button or sidebar overlay/close */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /** Toggles sidebar collapsed state & syncs with SidebarService for layout adjustment */
  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidebarService.setCollapsed(this.isSidebarCollapsed);
  }

  /** Closes sidebar on mobile screens (< 992px) - triggered by clicking a nav link */
  closeSidebarOnMobile(): void {
    if (isPlatformBrowser(this._platformId) && window.innerWidth < 992) {
      this.isSidebarOpen = false;
    }
  }

  // ─── Navbar Event Handlers ───

  /** Toggles the user dropdown menu in the navbar */
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  /** Loads username from localStorage (browser-only) */
  loadUserName(): void {
    if (isPlatformBrowser(this._platformId)) {
      const instructorName = localStorage.getItem('username');
      this.userName = instructorName || 'Instructor';
    }
  }

  /** Removes auth token from localStorage on logout */
  logout(): void {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.removeItem('token');
      this._router.navigate(['/login']);
    }
  }
}
