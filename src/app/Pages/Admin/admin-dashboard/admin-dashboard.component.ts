import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminDashboardService } from '../../../Core/Services/Admin/admin-dashboard.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { AdminDashboardStatsResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-dashboard-stats-response';
import { AdminDashboardChartsResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-dashboard-charts-response';
import { AdminDashboardReviewsResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-dashboard-reviews-response';
import { AdminDashboardQuickActionsResponse } from '../../../Core/Interfaces/AdminInterfaces/admin-dashboard-quick-actions-response';
import { finalize } from 'rxjs';
import { ButtonDirective } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { ChartsRequest } from '../../../Core/Interfaces/Analyzer/charts-request';

interface StatsCard {
  icon: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  color: string;
}

interface QuickAction {
  icon: string;
  label: string;
  count: number;
  route: string;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonDirective,
    RatingModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  adminName = '';
  isLoading = true;
  isChartsLoading = true;
  isReviewsLoading = true;

  stats: AdminDashboardStatsResponse = {
    users: 0,
    students: 0,
    instructors: 0,
    courses: 0,
    publishedCourses: 0,
    revenue: 0,
  };

  charts: AdminDashboardChartsResponse = { charts: [] };
  reviews: AdminDashboardReviewsResponse[] = [];
  quickActions: AdminDashboardQuickActionsResponse = {
    draftCoursesCount: 0,
    pendingCoursesCount: 0,
    pendingInstructorsCount: 0,
  };

  statsCards: StatsCard[] = [];
  quickActionItems: QuickAction[] = [];

  fromDate!: Date;
  toDate!: Date;

  rangeDates: Date[] = [];
  selectedRange = 11;

  private initiateDateRange(): void {
    const now = new Date();

    this.fromDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
    );

    this.toDate = new Date();
    this.rangeDates = [this.fromDate, this.toDate];
  }

  constructor(
    private readonly _adminDashboardService: AdminDashboardService,
    private readonly _notifications: NotificationsService,
    @Inject(PLATFORM_ID) private readonly _platformId: object,
  ) {}

  ngOnInit(): void {
    this.loadUserName();
    this.initiateDateRange();
    this.loadStats();
    this.loadCharts();
    this.loadReviews();
    this.loadQuickActions();
  }

  loadUserName(): void {
    if (isPlatformBrowser(this._platformId)) {
      const username = localStorage.getItem('username');
      this.adminName = username || 'Admin';
    }
  }

  loadStats(): void {
    this.isLoading = true;
    this._adminDashboardService
      .getStats()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<AdminDashboardStatsResponse>) => {
          if (res.succeed && res.data) {
            this.stats = res.data;
            this.buildStatsCards();
          } else {
            this._notifications.showError(
              res.message || 'Failed to load stats.',
              'Error',
            );
          }
          this.isLoading = false;
        },
      });
  }

  loadCharts(): void {
    const chartRequest: ChartsRequest = {
      fromDate: this.fromDate.toISOString(),
      toDate: this.toDate.toISOString(),
    };
    console.log(this.fromDate);
    console.log(this.toDate);
    this.isChartsLoading = true;
    this._adminDashboardService
      .getCharts(chartRequest)
      .pipe(finalize(() => (this.isChartsLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<AdminDashboardChartsResponse>) => {
          if (res.succeed && res.data) {
            this.charts = res.data;
          }
          this.isChartsLoading = false;
        },
      });
  }

  loadReviews(): void {
    this.isReviewsLoading = true;
    this._adminDashboardService
      .getLastedReview()
      .pipe(finalize(() => (this.isReviewsLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<AdminDashboardReviewsResponse>) => {
          if (res.succeed && res.data) {
            // The API returns a single object or array depending on implementation
            // We handle both cases safely
            const data = res.data as unknown;
            this.reviews = Array.isArray(data)
              ? (data as AdminDashboardReviewsResponse[])
              : [data as AdminDashboardReviewsResponse];
          }
          this.isReviewsLoading = false;
        },
      });
  }

  loadQuickActions(): void {
    this._adminDashboardService
      .getQuickActions()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<AdminDashboardQuickActionsResponse>) => {
          if (res.succeed && res.data) {
            this.quickActions = res.data;
            this.buildQuickActions();
          }
        },
      });
  }

  buildStatsCards(): void {
    this.statsCards = [
      {
        icon: 'pi-users',
        title: 'Total Users',
        value: this.stats.users,
        change: '+12%',
        changeType: 'positive',
        color: 'blue',
      },
      {
        icon: 'pi-user-plus',
        title: 'Students',
        value: this.stats.students,
        change: '+8%',
        changeType: 'positive',
        color: 'green',
      },
      {
        icon: 'pi-briefcase',
        title: 'Instructors',
        value: this.stats.instructors,
        change: '+5%',
        changeType: 'positive',
        color: 'purple',
      },
      {
        icon: 'pi-book',
        title: 'Courses',
        value: this.stats.courses,
        change: '+15%',
        changeType: 'positive',
        color: 'orange',
      },
      {
        icon: 'pi-check-circle',
        title: 'Published',
        value: this.stats.publishedCourses,
        change: '+10%',
        changeType: 'positive',
        color: 'teal',
      },
      {
        icon: 'pi-dollar',
        title: 'Revenue',
        value: '$' + this.formatNumber(this.stats.revenue),
        change: '+22%',
        changeType: 'positive',
        color: 'red',
      },
    ];
  }

  buildQuickActions(): void {
    this.quickActionItems = [
      {
        icon: 'pi-file-edit',
        label: 'Draft Courses',
        count: this.quickActions.draftCoursesCount,
        route: '/admin/courses?status=draft',
        color: 'gray',
      },
      {
        icon: 'pi-clock',
        label: 'Pending Courses',
        count: this.quickActions.pendingCoursesCount,
        route: '/admin/courses?status=pending',
        color: 'yellow',
      },
      {
        icon: 'pi-user-plus',
        label: 'Pending Instructors',
        count: this.quickActions.pendingInstructorsCount,
        route: '/admin/instructors?status=pending',
        color: 'indigo',
      },
    ];
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getAvatar(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getMaxValue(data: { lable: string; value: number }[]): number {
    return Math.max(...data.map((d) => d.value), 1);
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600)
      return Math.floor(diffInSeconds / 60) + ' min ago';
    if (diffInSeconds < 86400)
      return Math.floor(diffInSeconds / 3600) + ' hours ago';
    if (diffInSeconds < 604800)
      return Math.floor(diffInSeconds / 86400) + ' days ago';
    return date.toLocaleDateString();
  }

  changeRange(months: number): void {
    this.selectedRange = months;
    this.fromDate = new Date();
    this.toDate = new Date();

    if (months === 1) this.fromDate.setDate(this.fromDate.getDate() - 29);
    else this.fromDate.setMonth(this.fromDate.getMonth() - months);

    this.loadCharts();
  }
}
