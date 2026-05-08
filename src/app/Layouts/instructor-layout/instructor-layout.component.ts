import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructorNavComponent } from '../../Components/instructor/instructor-nav/instructor-nav.component';
import { InstructorFooterComponent } from '../../Components/instructor/instructor-footer/instructor-footer.component';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from '../../Core/Services/sidebar.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-instructor-layout',
  standalone: true,
  imports: [CommonModule, InstructorNavComponent, InstructorFooterComponent, RouterOutlet],
  templateUrl: './instructor-layout.component.html',
  styleUrl: './instructor-layout.component.scss',
})
export class InstructorLayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  private destroy$ = new Subject<void>();

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sidebarService.isCollapsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isCollapsed) => {
        this.isSidebarCollapsed = isCollapsed;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}