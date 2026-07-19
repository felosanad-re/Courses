import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { AnalyzeService } from '../../../Core/Services/Analyzer/analyze.service';
import { InstructorEarningService } from '../../../Core/Services/Instructor-Earning/instructor-earning.service';
import { InstructorEarningStatsResponse } from '../../../Core/Interfaces/Earnings/instructor-earning-stats-response';
import { InstructorWithEnrollmentsDetails } from '../../../Core/Interfaces/Earnings/instructor-with-enrollments-details';
import { EnrollmentsParams } from '../../../Core/Interfaces/Earnings/enrollments-params';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { MonthlyAnalyticsDto } from '../../../Core/Interfaces/Analyzer/monthly-analytics-dto';
import { ChartsRequest } from '../../../Core/Interfaces/Analyzer/charts-request';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { finalize } from 'rxjs';
import { LoadingSkeletonComponent } from '../../../Shared/loading-skeleton/loading-skeleton.component';

interface StatCard {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
}

interface TimePeriod {
  label: string;
  key: string;
  fromDate: Date;
  toDate: Date;
}

@Component({
  selector: 'app-earning-instructor',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    ButtonModule,
    PaginatorModule,
    LoadingSkeletonComponent,
  ],
  templateUrl: './earning-instructor.component.html',
  styleUrl: './earning-instructor.component.scss',
})
export class EarningInstructorComponent implements OnInit {
  earningStats: InstructorEarningStatsResponse =
    {} as InstructorEarningStatsResponse;
  isLoading = true;
  isChartsLoading = false;
  statsCards: StatCard[] = [];

  // Time period filter
  timePeriods: TimePeriod[] = [];
  selectedPeriodKey: string = 'default';

  // ─── Getter for selected period label ───
  get selectedPeriodLabel(): string {
    if (this.selectedPeriodKey === 'default') return 'Last 3 Months';
    const period = this.timePeriods.find(
      (p) => p.key === this.selectedPeriodKey,
    );
    return period ? period.label : 'Last 3 Months';
  }

  // Chart data
  lineChartData: any;
  lineChartOptions: any;

  // Enrollments table
  enrollments: InstructorWithEnrollmentsDetails[] = [];
  enrollmentsParams = new EnrollmentsParams();
  totalEnrollmentsCount = 0;
  isEnrollmentsLoading = false;

  constructor(
    private readonly _analyzeService: AnalyzeService,
    private readonly _earningService: InstructorEarningService,
    private readonly _notification: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.buildTimePeriods();
    this.loadStats();
    this.loadCharts();
    this.loadEnrollments();
  }

  // ─── Build Time Periods ───
  private buildTimePeriods(): void {
    const now = new Date();

    // This Month
    const thisMonthFrom = new Date(now.getFullYear(), now.getMonth(), 1);

    // Last 3 Months
    const last3MonthsFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // Last 6 Months
    const last6MonthsFrom = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // This Year (Last 12 Months)
    const thisYearFrom = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    this.timePeriods = [
      {
        label: 'This Month',
        key: 'this-month',
        fromDate: thisMonthFrom,
        toDate: now,
      },
      {
        label: 'Last 3 Months',
        key: 'last-3-months',
        fromDate: last3MonthsFrom,
        toDate: now,
      },
      {
        label: 'Last 6 Months',
        key: 'last-6-months',
        fromDate: last6MonthsFrom,
        toDate: now,
      },
      {
        label: 'This Year',
        key: 'this-year',
        fromDate: thisYearFrom,
        toDate: now,
      },
    ];
  }

  // ─── Select Period ───
  selectPeriod(periodKey: string): void {
    if (this.selectedPeriodKey === periodKey) return;
    this.selectedPeriodKey = periodKey;
    const period = this.timePeriods.find((p) => p.key === periodKey);
    if (!period) return;

    this.loadStats(period.fromDate.toISOString(), period.toDate.toISOString());
    this.loadCharts(period.fromDate.toISOString(), period.toDate.toISOString());
  }

  // ─── Reset to Default ───
  resetToDefault(): void {
    if (this.selectedPeriodKey === 'default') return;
    this.selectedPeriodKey = 'default';
    this.loadStats();
    this.loadCharts();
  }

  // ─── Load Stats (no dates = backend default last 3 months) ───
  loadStats(fromDate?: string, toDate?: string): void {
    this.isLoading = true;

    this._earningService
      .getEarningStats(fromDate, toDate)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<InstructorEarningStatsResponse>) => {
          if (res.succeed && res.data) {
            this.earningStats = res.data;
            this.buildStatsCards();
          }
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  // ─── Load Charts (no dates = backend default) ───
  loadCharts(fromDate?: string, toDate?: string): void {
    this.isChartsLoading = true;
    this.lineChartData = null;

    const chartRequest: ChartsRequest = {};
    if (fromDate) chartRequest.fromDate = fromDate;
    if (toDate) chartRequest.toDate = toDate;

    this._analyzeService
      .getAnalyzeCharts(chartRequest)
      .pipe(finalize(() => (this.isChartsLoading = false)))
      .subscribe({
        next: (res: ApplicationResult<MonthlyAnalyticsDto[]>) => {
          if (res.succeed && res.data) {
            this.buildLineChart(res.data);
          }
        },
      });
  }

  // ─── Icon Class Helper ───
  getIconClass(title: string): string {
    return 'stat-card__icon--' + title.toLowerCase().replace(/\s+/g, '-');
  }

  // ─── Build Stats Cards ───
  private buildStatsCards(): void {
    this.statsCards = [
      {
        icon: 'pi-dollar',
        title: 'Total Earnings',
        value: `$${this.earningStats.totalEarnings}`,
        subtitle: 'Lifetime earnings',
      },
      {
        icon: 'pi-calendar',
        title: 'Period Earnings',
        value: `$${this.earningStats.periodEarnings}`,
        subtitle: 'Earnings in selected period',
      },
      {
        icon: 'pi-users',
        title: 'Period Enrollments',
        value: this.earningStats.periodEnrollments,
        subtitle: 'Enrollments in selected period',
      },
      {
        icon: 'pi-chart-line',
        title: 'Average per paid enrollment',
        value: `$${this.earningStats.averageRevenueEnrollments}`,
        subtitle: 'Average per enrollment',
      },
    ];
  }

  // ─── Build Line Chart ───
  private buildLineChart(data: MonthlyAnalyticsDto[]): void {
    const labels = data.map((d) => d.monthLabel);
    const earnings = data.map((d) => d.earnings);

    this.lineChartData = {
      labels,
      datasets: [
        {
          label: 'Earnings',
          data: earnings,
          fill: true,
          tension: 0.4,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `$${context.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#6b7280',
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#e5e7eb',
          },
          ticks: {
            color: '#6b7280',
            callback: (value: number) => `$${value}`,
          },
        },
      },
    };
  }

  // ─── Load Enrollments ───
  loadEnrollments(): void {
    this.isEnrollmentsLoading = true;
    this._earningService
      .getInstructorEnrollments(this.enrollmentsParams)
      .pipe(finalize(() => (this.isEnrollmentsLoading = false)))
      .subscribe({
        next: (
          res: ApplicationResult<
            Pagination<InstructorWithEnrollmentsDetails[]>
          >,
        ) => {
          if (res.succeed && res.data) {
            this.enrollments = res.data.data;
            this.totalEnrollmentsCount = res.data.count;
          }
        },
      });
  }

  // ─── Page Change ───
  onPageChange(event: any): void {
    this.enrollmentsParams.pageIndex = event.page + 1;
    this.enrollmentsParams.pageSize = event.rows;
    this.loadEnrollments();
  }
}
