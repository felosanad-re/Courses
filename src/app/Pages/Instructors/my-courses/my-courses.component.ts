import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { skip, Subscription } from 'rxjs';
import { InstructorsService } from '../../../Core/Services/Instructors/instructors.service';
import { SearchService } from '../../../Core/Services/search.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { CoursesParams } from '../../../Core/Interfaces/Courses/courses-params';
import { InstructorWithCoursesResponse } from '../../../Core/Interfaces/Instructors/instructor-with-courses-response';

interface StatsCard {
  icon: string;
  title: string;
  value: string | number;
  colorClass: string;
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    FormsModule,
    RouterModule,
    PaginatorModule,
    TagModule,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss',
})
export class MyCoursesComponent implements OnInit, OnDestroy {
  courses: InstructorWithCoursesResponse[] = [];
  isLoading = true;

  // Pagination
  first: number = 0;
  pageIndex: number = 1;
  pageSize: number = 6;
  totalCount: number = 0;

  // Search
  searchTerm: string = '';
  private searchSubscription!: Subscription;

  // Stats
  statsCards: StatsCard[] = [];

  constructor(
    private readonly _instructorsService: InstructorsService,
    private readonly _searchService: SearchService,
    @Inject(PLATFORM_ID) private readonly _platformId: object,
  ) {}

  ngOnInit(): void {
    // Listen to global search from sidebar, skip(1) to avoid double load on init
    this.searchSubscription = this._searchService.$searchTerm
      .pipe(skip(1))
      .subscribe((term) => {
        this.searchTerm = term;
        this.resetPagination();
        this.loadCourses();
      });

    this.loadCourses();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadCourses(): void {
    this.isLoading = true;
    const params = new CoursesParams();
    params.pageIndex = this.pageIndex;
    params.pageSize = this.pageSize;
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this._instructorsService.getMyCourses(params).subscribe({
      next: (
        response: ApplicationResult<
          Pagination<InstructorWithCoursesResponse[]>
        >,
      ) => {
        if (response.succeed && response.data) {
          this.courses = response.data.data;
          this.totalCount = response.data.count;
          this.computeStats();
        } else {
          this.courses = [];
          this.totalCount = 0;
        }
        this.isLoading = false;
      },
    });
  }

  /** Compute aggregate stats from all returned courses */
  computeStats(): void {
    const totalEnrollment = this.courses.reduce(
      (sum, c) => sum + c.totalEnrollment,
      0,
    );
    const totalRevenues = this.courses.reduce(
      (sum, c) => sum + c.totalRevenues,
      0,
    );

    this.statsCards = [
      {
        icon: 'pi-book',
        title: 'Total Courses',
        value: this.totalCount,
        colorClass: 'stat-card--courses',
      },
      {
        icon: 'pi-users',
        title: 'Total Enrollment',
        value: totalEnrollment,
        colorClass: 'stat-card--enrollment',
      },
      {
        icon: 'pi-dollar',
        title: 'Total Revenue',
        value: totalRevenues,
        colorClass: 'stat-card--revenue',
      },
    ];
  }

  isOnlineCourse(status: string): boolean {
    const normalizedStatus = this.normalizeCourseStatus(status);
    return normalizedStatus === 'onlinecourse' || normalizedStatus === '0';
  }

  getCourseStatusLabel(status: string): string {
    return this.isOnlineCourse(status) ? 'Online' : 'Recorded';
  }

  private normalizeCourseStatus(status: string): string {
    return String(status ?? '')
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  onPageChange(event: any): void {
    const rows = event.rows ?? this.pageSize;
    const page = event.page ?? 0;
    this.first = event.first ?? 0;
    this.pageSize = rows;
    this.pageIndex = page + 1;
    this.loadCourses();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetPagination(): void {
    this.pageIndex = 1;
    this.first = 0;
  }

  /** Check if a course has any enrolled students */
  hasEnrollments(course: InstructorWithCoursesResponse): boolean {
    return course.totalEnrollment > 0;
  }
}
