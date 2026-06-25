import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { finalize } from 'rxjs';
import { LiveSessionListResponse } from '../../../Core/Interfaces/LiveSessions/live-session-list-response';
import { ManagementOnlineService } from '../../../Core/Services/ManagementOnlineCourses/management-online.service';
import { SessionParams } from '../../../Core/Interfaces/LiveSessions/session-params';
import { Pagination } from '../../../Core/Interfaces/Courses/pagination';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { LiveSessionStatisticsResponse } from '../../../Core/Interfaces/LiveSessions/live-session-statistics-response';
import { LiveSessionDetailsResponse } from '../../../Core/Interfaces/LiveSessions/live-session-details-response';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { SearchService } from '../../../Core/Services/search.service';

interface SessionStat {
  label: string;
  value: number;
  icon: string;
  tone: 'blue' | 'green' | 'slate' | 'red';
}

@Component({
  selector: 'app-live-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorModule],
  templateUrl: './live-sessions.component.html',
  styleUrl: './live-sessions.component.scss',
})
export class LiveSessionsComponent implements OnInit {
  sessions: LiveSessionListResponse[] = [];
  sessionParams: SessionParams = new SessionParams();
  hostJoin?: string;
  emptyStateTitle = 'No live sessions found';
  emptyStateMessage =
    'Try changing the search keyword or selecting another status filter.';
  sessionCount = 0;
  totalPages = 0;
  first = 0;
  isLoading = false;
  isMutatingSessionId?: number;
  stats: SessionStat[] = [];

  constructor(
    private readonly _sessionsService: ManagementOnlineService,
    private readonly _notifications: NotificationsService,
    private readonly _searchService: SearchService,
    private readonly _router: Router,
  ) {}

  ngOnInit(): void {
    this.listenToSearch();
    this.getStats();
  }

  getSessions(): void {
    this.isLoading = true;
    this._sessionsService
      .getSessions(this.sessionParams)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (
          res: ApplicationResult<Pagination<LiveSessionListResponse[]>>,
        ) => {
          if (!res.succeed || !res.data) {
            this.sessions = [];
            this.sessionCount = 0;
            this.totalPages = 0;
            this.emptyStateTitle = 'Unable to load live sessions';
            this.emptyStateMessage = res.message || 'Please try again later.';
            return;
          }

          const pagination = res.data;
          this.sessions = pagination.data || [];
          this.sessionCount = pagination.count || 0;
          this.sessionParams.pageIndex =
            pagination.pageIndex || this.sessionParams.pageIndex;
          this.sessionParams.pageSize =
            pagination.pageSize || this.sessionParams.pageSize;
          this.totalPages = Math.ceil(
            this.sessionCount / this.sessionParams.pageSize,
          );
          this.first =
            (this.sessionParams.pageIndex - 1) * this.sessionParams.pageSize;

          if (!this.sessions.length) {
            this.emptyStateTitle = 'No live sessions found';
            this.emptyStateMessage =
              res.message ||
              'Try changing the search keyword or selecting another status filter.';
          }
        },
      });
  }

  getStats(): void {
    this._sessionsService.getSessionStatus().subscribe({
      next: (res: ApplicationResult<LiveSessionStatisticsResponse>) => {
        if (res.succeed && res.data) {
          const totalSessions = res.data.totalSessions;
          const upcomingSessions = res.data.upcomingSessions;
          const completedSessions = res.data.completedSessions;
          const cancelledSessions = res.data.cancelledSessions;
          this.stats = [
            {
              label: 'Total Sessions',
              value: totalSessions,
              icon: 'pi pi-video',
              tone: 'blue',
            },
            {
              label: 'Upcoming Sessions',
              value: upcomingSessions,
              icon: 'pi pi-calendar',
              tone: 'green',
            },
            {
              label: 'Completed Sessions',
              value: completedSessions,
              icon: 'pi pi-check-circle',
              tone: 'slate',
            },
            {
              label: 'Cancelled Sessions',
              value: cancelledSessions,
              icon: 'pi pi-times-circle',
              tone: 'red',
            },
          ];
          this.getSessions();
        }
      },
    });
  }

  updateSession(session: LiveSessionListResponse): void {
    this._router.navigate([
      '/instructor/online-sessions/update',
      0,
      session.sectionId,
      session.id,
    ]);
  }

  startSession(session: LiveSessionListResponse): void {
    this.isMutatingSessionId = session.id;
    this._sessionsService
      .getSessionDetails(session.id)
      .pipe(finalize(() => (this.isMutatingSessionId = undefined)))
      .subscribe({
        next: (res: ApplicationResult<LiveSessionDetailsResponse>) => {
          if (res.succeed && res.data?.hostJoinUrl) {
            window.open(res.data.hostJoinUrl, '_blank', 'noopener');
            return;
          }

          this._notifications.showError(
            res.message || 'Failed to get host join link.',
            'Start Session Failed',
          );
        },
      });
  }

  deleteSession(session: LiveSessionListResponse): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${session.topic}"?`,
    );
    if (!confirmed) return;

    this.isMutatingSessionId = session.id;
    this._sessionsService
      .deleteSession(session.id)
      .pipe(finalize(() => (this.isMutatingSessionId = undefined)))
      .subscribe({
        next: (res: ApplicationResult<boolean>) => {
          if (res.succeed) {
            this._notifications.showSuccess(
              res.message || 'Live session deleted successfully',
              'Delete Session Succeeded',
            );

            if (
              this.sessions.length === 1 &&
              this.sessionParams.pageIndex > 1
            ) {
              this.sessionParams.pageIndex--;
            }
            this.getStats();
            return;
          }

          this._notifications.showError(
            res.message || 'Failed to delete live session.',
            'Delete Session Failed',
          );
        },
      });
  }

  onSearch(search: string): void {
    this._searchService.updateSearchTrim(search);
  }

  onStatusChange(status: string): void {
    this.sessionParams.sort = status === 'All' ? undefined : status;
    this.sessionParams.pageIndex = 1;
    this.getSessions();
  }

  onPageChange(event: any): void {
    const rows = event.rows ?? this.sessionParams.pageSize;
    const page = event.page ?? 0;

    this.first = event.first ?? 0;
    this.sessionParams.pageSize = rows;
    this.sessionParams.pageIndex = page + 1;
    this.getSessions();
  }

  canStartSession(session: LiveSessionListResponse): boolean {
    const scheduledAt = new Date(session.scheduledAt).getTime();
    if (Number.isNaN(scheduledAt)) return false;

    const now = Date.now();
    const fiveMinutesBeforeStart = scheduledAt - 5 * 60 * 1000;
    const sessionEnd = scheduledAt + session.durationMinutes * 60 * 1000;

    return now >= fiveMinutesBeforeStart && now <= sessionEnd;
  }

  private listenToSearch(): void {
    this._searchService.$searchTerm.subscribe((search) => {
      this.sessionParams.search = search.trim() || undefined;
      this.sessionParams.pageIndex = 1;
      this.getSessions();
    });
  }

  readonly statuses = ['All', 'Scheduled', 'Live', 'Completed', 'Cancelled'];
}
