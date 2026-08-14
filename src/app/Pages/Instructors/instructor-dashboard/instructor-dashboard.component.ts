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
import { finalize, skip, Subscription } from 'rxjs';
import { PaginatorModule } from 'primeng/paginator';
import { InstructorDashboardStatsService } from '../../../Core/Services/DashboardStats/instructor-dashboard-stats.service';
import { InstructorStats } from '../../../Core/Interfaces/DashboardStats/instructor-stats';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { Review } from '../../../Core/Interfaces/DashboardStats/review';
import { RatingParams } from '../../../Core/Interfaces/DashboardStats/rating-params';
import { InstructorActivitiesResponse } from '../../../Core/Interfaces/Instructors/instructor-activities-response';
import { InstructorActivityType } from '../../../Core/Interfaces/Instructors/instructor-activity-type';

interface StatsCard {
  icon: string;
  title: string;
  value: string | number;
  change?: number | string;
  changeType?: 'positive' | 'negative';
}

interface Activity {
  id: number;
  icon: string;
  message: string;
  time: string;
  type: 'enrollment' | 'review';
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
  activities: InstructorActivitiesResponse[] = [];
  isLoading = true;
  isActivitiesLoading = true;
  isReviewsLoading = true;
  courses: CourseResponseForInstructor[] = [];
  stats: InstructorStats = {
    totalCourses: 0,
    totalNewCoursesInMonth: 0,
    totalStudents: 0,
    totalRevenues: 0,
    newTotalStudentsInMonth: 0,
    newTotalRevenuesInMonth: 0,
    averageRating: 0,
    newAverageRatingInMonth: 0,
  };

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

  statsCards: StatsCard[] = [];

  recentActivities: Activity[] = [];

  reviews: Review[] = [];

  constructor(
    private readonly _instructorsService: InstructorsService,
    private readonly _searchService: SearchService,
    private readonly _router: Router,
    private readonly _statsService: InstructorDashboardStatsService,
    private readonly _notifications: NotificationsService,
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

    this.getStats();
    this.loadCourses();
    this.loadActivities();
    this.loadReviews();
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
          this.pageIndex = response.data.pageIndex || this.pageIndex;
          this.pageSize = response.data.pageSize || this.pageSize;
          this.first = (this.pageIndex - 1) * this.pageSize;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getStats() {
    this._statsService.getStats().subscribe({
      next: (res: ApplicationResult<InstructorStats>) => {
        if (res.succeed && res.data) {
          this.stats = res.data;
          this.buildStatsCards();
        } else {
          this._notifications.showError(
            res.message || 'Failed to load stats.',
            'Error',
          );
        }
      },
    });
  }

  loadActivities(): void {
    this.isActivitiesLoading = true;
    this._instructorsService
      .getInstructorActivities()
      .pipe(finalize(() => (this.isActivitiesLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<InstructorActivitiesResponse[]>) => {
          if (res.succeed && res.data) {
            this.activities = res.data;
            this.buildActivities();
          } else {
            this.recentActivities = [];
          }
        },
        error: () => {
          this.recentActivities = [];
        },
      });
  }

  loadReviews(): void {
    this.isReviewsLoading = true;
    const ratingParams = new RatingParams();
    this._statsService.getReviews(ratingParams).subscribe({
      next: (res: ApplicationResult<Pagination<Review[]>>) => {
        if (res.succeed && res.data) {
          this.reviews = res.data.data.map((review) => ({
            ...review,
            avatar: this.getAvatar(review.studentName),
          }));
        } else {
          this._notifications.showError(
            res.message || 'Failed to load reviews.',
            'Error',
          );
        }
        this.isReviewsLoading = false;
      },
      error: () => {
        this.isReviewsLoading = false;
      },
    });
  }

  /** Static avatar fallback derived from the student's name initials */
  private getAvatar(name: string): string {
    if (!name) {
      return '?';
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  private buildStatsCards(): void {
    this.statsCards = [
      {
        icon: 'pi-book',
        title: 'Total Courses',
        value: this.stats.totalCourses,
        change: `+${this.stats.totalNewCoursesInMonth} This month`,
        changeType: 'positive',
      },
      {
        icon: 'pi-users',
        title: 'Total Students',
        value: this.stats.totalStudents,
        change: `+${this.stats.newTotalStudentsInMonth} This month`,
        changeType: 'positive',
      },
      {
        icon: 'pi-wallet',
        title: 'Total Revenue',
        value: `${this.stats.totalRevenues}$`,
        change: `+${this.stats.newTotalRevenuesInMonth}$ This month`,
        changeType: 'positive',
      },
      {
        icon: 'pi-star',
        title: 'Average Rating',
        value: `${this.stats.averageRating}`,
        change: `+${this.stats.newAverageRatingInMonth}$ This month`,
        changeType: 'positive',
      },
    ];
  }

  private buildActivities(): void {
    this.recentActivities = this.activities.map(
      (activity, index) => {
        const activityType = String(activity.type).toLowerCase();
        const isEnrollment =
          activityType === InstructorActivityType.Enrollment.toLowerCase() ||
          activityType === '1';
        const isRating =
          activityType === InstructorActivityType.Rating.toLowerCase() ||
          activityType === '2';

        if (isEnrollment) {
          return {
            
            id: index,
            icon: 'pi-user-plus',
            message: `${activity.studentName} enrolled in ${activity.courseTitle}`,
            time: this.formatActivityDate(activity.createdAt),
            type: 'enrollment',
          };
        } else if (isRating) {
          return ({
            id: index,
            icon: 'pi-star',
            message: `${activity.studentName} left a ${activity.rating}-star rating`,
            time: this.getRelativeTime(activity.createdAt),
            type: 'review',
          });
        }

        return null;
      },
    ).filter((x): x is Activity => x !== null);
  }

  private formatActivityDate(createdAt: Date): string {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private getRelativeTime(createdAt: Date): string {
    const createdAtTime = new Date(createdAt).getTime();
    if (Number.isNaN(createdAtTime)) {
      return '';
    }

    const elapsedSeconds = Math.max(
      0,
      Math.floor((Date.now() - createdAtTime) / 1000),
    );

    if (elapsedSeconds < 60) {
      return 'Just now';
    }

    const units = [
      { seconds: 31536000, label: 'year' },
      { seconds: 2592000, label: 'month' },
      { seconds: 86400, label: 'day' },
      { seconds: 3600, label: 'hour' },
      { seconds: 60, label: 'minute' },
    ];
    const unit = units.find(({ seconds }) => elapsedSeconds >= seconds)!;
    const value = Math.floor(elapsedSeconds / unit.seconds);

    return `${value} ${unit.label}${value === 1 ? '' : 's'} ago`;
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
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

  isOnlineCourse(type: string): boolean {
    const normalizedType = this.normalizeCourseType(type);
    return normalizedType === 'onlinecourse' || normalizedType === '0';
  }

  getCourseTypeLabel(type: string): string {
    return this.isOnlineCourse(type) ? 'Online' : 'Recorded';
  }

  private normalizeCourseType(type: string): string {
    return String(type ?? '')
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  // edit course
  updateCourse(courseId: number): void {
    this._router.navigate(['/instructor', 'update-course', courseId]);
  }

  //view Course
  viewCourse(courseId: number): void {
    this._router.navigate(['/instructor', 'course-sections-details', courseId]);
  }
}
