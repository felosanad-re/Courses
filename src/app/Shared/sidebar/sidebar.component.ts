import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

/**
 * NavItem interface - exported so parent components can use it
 * to define their own navigation items and pass them via [navItems] input
 */
export interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  // ─── Input Properties ───
  // Parent (instructor-nav) controls the sidebar state and passes data down

  /** Whether the sidebar is open/visible - controlled by parent */
  @Input() isSidebarOpen = true;

  /** Whether the sidebar is collapsed (icon-only mode) - controlled by parent */
  @Input() isSidebarCollapsed = false;

  /** Navigation items array - each role (instructor, admin, etc.) passes its own items */
  @Input() navItems: NavItem[] = [];

  /** User display name - passed from parent (loaded from localStorage) */
  @Input() userName = '';

  /** User role label (e.g. "Mathematics Instructor") - passed from parent */
  @Input() userRole = '';

  // ─── Output Events ───
  // Sidebar emits events up to parent so parent manages the actual state changes

  /** Emitted when overlay or close button is clicked - parent toggles isSidebarOpen */
  @Output() sidebarToggle = new EventEmitter<void>();

  /** Emitted when collapse button is clicked - parent toggles isSidebarCollapsed & updates SidebarService */
  @Output() sidebarCollapseToggle = new EventEmitter<void>();

  /** Emitted when a nav link is clicked on mobile - parent closes sidebar on small screens */
  @Output() sidebarCloseOnMobile = new EventEmitter<void>();

  constructor(@Inject(PLATFORM_ID) private readonly _platformId: object) {}

  /** Emits sidebarToggle event - parent handles the actual state change */
  onToggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  /** Emits sidebarCollapseToggle event - parent handles state + SidebarService */
  onToggleSidebarCollapse(): void {
    this.sidebarCollapseToggle.emit();
  }

  /** Emits sidebarCloseOnMobile event only on small screens (< 992px) */
  onCloseSidebarOnMobile(): void {
    if (isPlatformBrowser(this._platformId) && window.innerWidth < 992) {
      this.sidebarCloseOnMobile.emit();
    }
  }
}
