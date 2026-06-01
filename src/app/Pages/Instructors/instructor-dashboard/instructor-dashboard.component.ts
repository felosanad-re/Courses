import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { InstructorsService } from '../../../Core/Services/Instructors/instructors.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseResponseForInstructor } from '../../../Core/Interfaces/Instructors/course-response-for-instructor';
import { SearchService } from '../../../Core/Services/search.service';
import { CoursesParams } from '../../../Core/Interfaces/Courses/courses-params';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { skip, Subscription } from 'rxjs';
import { PaginatorModule } from 'primeng/paginator';

interface StatsCard {
  icon: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
}

interface Activity {
  id: number;
  icon: string;
  message: string;
  time: string;
  type: 'enrollment' | 'review' | 'payment' | 'course';
}

interface Review {
  id: number;
  studentName: string;
  avatar: string;
  rating: number;
  comment: string;
  course: string;
  date: string;
}

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginatorModule],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.scss',
})
export class InstructorDashboardComponent implements OnInit, OnDestroy {
  instructorName = '';
  isLoading = true;
  courses: CourseResponseForInstructor[] = [];

  // ─── Pagination Variables ───
  // PrimeNG Paginator uses "first" (offset) and "rows" (pageSize):
  // - first = 0 → page 1, first = 10 → page 2, etc.
  // - pageIndex (for backend API) = (first / rows) + 1
  first: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  courseCount: number = 0;

  searchTerm: string = '';

  private searchSubscription!: Subscription;

  statsCards: StatsCard[] = [
    {
      icon: 'pi-book',
      title: 'Total Courses',
      value: this.courseCount,
      change: '+0 this month',
      changeType: 'positive',
    },
    {
      icon: 'pi-users',
      title: 'Total Students',
      value: '0',
      change: '+0 this month',
      changeType: 'positive',
    },
    {
      icon: 'pi-wallet',
      title: 'Total Revenue',
      value: '$0',
      change: '+0% this month',
      changeType: 'positive',
    },
    {
      icon: 'pi-star',
      title: 'Average Rating',
      value: 0,
      change: '+0 this month',
      changeType: 'positive',
    },
  ];

  recentActivities: Activity[] = [
    {
      id: 1,
      icon: 'pi-user-plus',
      message: 'New student enrolled in Advanced Mathematics',
      time: '2 min ago',
      type: 'enrollment',
    },
    {
      id: 2,
      icon: 'pi-star',
      message: 'New 5-star review on Physics for Beginners',
      time: '15 min ago',
      type: 'review',
    },
    {
      id: 3,
      icon: 'pi-wallet',
      message: 'Payment received: $49.99',
      time: '1 hour ago',
      type: 'payment',
    },
    {
      id: 4,
      icon: 'pi-video',
      message: 'New lecture added to Calculus Fundamentals',
      time: '3 hours ago',
      type: 'course',
    },
    {
      id: 5,
      icon: 'pi-user-plus',
      message: '5 new students enrolled',
      time: '5 hours ago',
      type: 'enrollment',
    },
  ];

  reviews: Review[] = [
    {
      id: 1,
      studentName: 'Sarah Ahmed',
      avatar: 'S',
      rating: 5,
      comment:
        'Excellent explanation! The course helped me understand complex concepts easily.',
      course: 'Advanced Mathematics',
      date: '2 days ago',
    },
    {
      id: 2,
      studentName: 'Mohamed Ali',
      avatar: 'M',
      rating: 4,
      comment: 'Great course overall. Would love more practice problems.',
      course: 'Physics for Beginners',
      date: '3 days ago',
    },
    {
      id: 3,
      studentName: 'Fatima Hassan',
      avatar: 'F',
      rating: 5,
      comment: 'Best instructor! Very patient and clear in explanations.',
      course: 'Calculus Fundamentals',
      date: '1 week ago',
    },
  ];

  constructor(
    private readonly _instructorsService: InstructorsService,
    private readonly _searchService: SearchService,
    private readonly _router: Router,
    @Inject(PLATFORM_ID) private readonly _platformId: object,
  ) {}

  ngOnInit(): void {
    this.loadUserName();

    // Search: skip(1) to avoid double load on init (BehaviorSubject emits '' initially)
    this.searchSubscription = this._searchService.$searchTerm
      .pipe(skip(1))
      .subscribe((term) => {
        this.searchTerm = term;
        // Reset pagination to page 1 when search term changes
        this.resetPagination();
        this.loadCourses();
      });

    this.loadCourses();
  }

  loadUserName(): void {
    if (isPlatformBrowser(this._platformId)) {
      const username = localStorage.getItem('username');
      this.instructorName = username || 'Instructor';
    }
  }

  loadCourses(): void {
    const courseParams = new CoursesParams();
    courseParams.pageIndex = this.pageIndex;
    courseParams.pageSize = this.pageSize;
    courseParams.search = this.searchTerm;
    this._instructorsService.getAllCourses(courseParams).subscribe({
      next: (
        response: ApplicationResult<Pagination<CourseResponseForInstructor[]>>,
      ) => {
        if (response.succeed && response.data) {
          this.courses = response.data.data;
          this.courseCount = response.data.count;
          this.updateStats();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  updateStats(): void {
    this.statsCards[0].value = this.courseCount;
    this.statsCards[1].value = '0';
    this.statsCards[3].value = 0;
  }

  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < Math.floor(rating) ? 1 : 0));
  }

  /**
   * Handle PrimeNG Paginator onPageChange event
   *
   * PrimeNG event structure: { first: number, rows: number, page: number, pageCount: number }
   * - first = offset (0-based): 0 for page 1, 10 for page 2, etc.
   * - rows = pageSize (IMPORTANT: PrimeNG uses "rows" not "row")
   * - page = page number (0-based): 0 for page 1, 1 for page 2, etc.
   *
   * We convert to 1-based pageIndex for our backend API: pageIndex = page + 1
   * Guard against NaN by using fallback values if event properties are undefined
   */
  onPageChange(event: any): void {
    // Guard against NaN: use fallback values if event properties are undefined
    const rows = event.rows ?? this.pageSize;
    const page = event.page ?? 0; // 0-based page number from PrimeNG

    this.first = event.first ?? 0;
    this.pageSize = rows;
    // Convert 0-based page to 1-based pageIndex for backend API
    this.pageIndex = page + 1;

    this.loadCourses();
  }

  /** Reset pagination to page 1 - called when search term changes */
  resetPagination(): void {
    this.pageIndex = 1;
    this.first = 0;
  }

  // edit course
  updateCourse(courseId: number): void {
    this._router.navigate(['/instructor', 'update-course', courseId]);
  }
}
