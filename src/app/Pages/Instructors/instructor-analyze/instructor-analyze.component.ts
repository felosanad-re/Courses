import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { AnalyzeService } from '../../../Core/Services/Analyzer/analyze.service';
import { InstructorAnalyticsDto } from '../../../Core/Interfaces/Analyzer/instructor-analytics-dto';
import { MonthlyAnalyticsDto } from '../../../Core/Interfaces/Analyzer/monthly-analytics-dto';
import { ChartsRequest } from '../../../Core/Interfaces/Analyzer/charts-request';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { finalize } from 'rxjs';

interface StatCard {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
}

@Component({
  selector: 'app-instructor-analyze',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    CalendarModule,
    ButtonModule,
  ],
  templateUrl: './instructor-analyze.component.html',
  styleUrl: './instructor-analyze.component.scss',
})
export class InstructorAnalyzeComponent implements OnInit {
  analyzeData: InstructorAnalyticsDto = {} as InstructorAnalyticsDto;
  isLoading = true;
  statsCards: StatCard[] = [];

  rangeDates: Date[] = [];

  private initDefaultDateRange(): void {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    this.rangeDates = [from, now];
  }
  isChartsLoading = false;

  // Bar chart: students per month
  barChartData: any;
  barChartOptions: any;

  // Line chart: revenue per month
  lineChartData: any;
  lineChartOptions: any;

  constructor(
    private readonly _analyzeService: AnalyzeService,
    private readonly _notification: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.initDefaultDateRange();
    this.loadAnalytics();
    this.loadCharts();
  }

  loadAnalytics(): void {
    this._analyzeService.getAnalyze().subscribe({
      next: (res: ApplicationResult<InstructorAnalyticsDto>) => {
        if (res.succeed && res.data) {
          this.analyzeData = res.data;
          this.buildStatsCards();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadCharts(): void {
    if (
      !this.rangeDates ||
      this.rangeDates.length < 2 ||
      !this.rangeDates[0] ||
      !this.rangeDates[1]
    ) {
      this._notification.showError('Please select a date range', 'Error');
      return;
    }

    this.isChartsLoading = true;
    this.barChartData = null;
    this.lineChartData = null;

    const fromDate = this.rangeDates[0];
    const toDate = this.rangeDates[1];

    const chartRequest: ChartsRequest = {
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    };

    this._analyzeService
      .getAnalyzeCharts(chartRequest)
      .pipe(
        finalize(() => {
          this.isChartsLoading = false;
        }),
      )
      .subscribe({
        next: (res: ApplicationResult<MonthlyAnalyticsDto[]>) => {
          if (res.succeed && res.data) {
            this.buildBarChart(res.data);
            this.buildLineChart(res.data);
          }
        },
      });
  }

  getIconClass(title: string): string {
    return 'stat-card__icon--' + title.toLowerCase().replace(/\s+/g, '-');
  }

  private buildStatsCards(): void {
    this.statsCards = [
      {
        icon: 'pi-users',
        title: 'Total Students',
        value: this.analyzeData.totalStudents,
        subtitle: 'Enrolled students',
      },
      {
        icon: 'pi-file',
        title: 'Total Enrollments',
        value: this.analyzeData.totalEnrollments,
        subtitle: 'Course enrollments',
      },
      {
        icon: 'pi-book',
        title: 'Total Courses',
        value: this.analyzeData.totalCourses,
        subtitle: 'All courses',
      },
      {
        icon: 'pi-dollar',
        title: 'Total Revenue',
        value: `$${this.analyzeData.totalRevenue}`,
        subtitle: 'Lifetime earnings',
      },
      {
        icon: 'pi-check-circle',
        title: 'Published Courses',
        value: this.analyzeData.publishedCourses ?? 0,
        subtitle: 'Live courses',
      },
      {
        icon: 'pi-pencil',
        title: 'Draft Courses',
        value: this.analyzeData.draftCourses ?? 0,
        subtitle: 'Unpublished courses',
      },
      {
        icon: 'pi-star',
        title: 'Average Rating',
        value: this.analyzeData.averageCourseRating ?? 0,
        subtitle: 'Course ratings',
      },
    ];
  }

  private buildBarChart(data: MonthlyAnalyticsDto[]): void {
    const labels = data.map((d) => d.monthLabel);
    const students = data.map((d) => d.students);

    this.barChartData = {
      labels,
      datasets: [
        {
          label: 'Students',
          data: students,
          backgroundColor: '#818cf8',
          borderColor: '#4f46e5',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
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
            stepSize: 1,
          },
        },
      },
    };
  }

  private buildLineChart(data: MonthlyAnalyticsDto[]): void {
    const labels = data.map((d) => d.monthLabel);
    const earnings = data.map((d) => d.earnings);

    this.lineChartData = {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: earnings,
          fill: true,
          tension: 0.4,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
}
