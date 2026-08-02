import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { AdminDashboardStatsResponse } from '../../Interfaces/AdminInterfaces/admin-dashboard-stats-response';
import { environment } from '../../../../environments/environment';
import { AdminDashboardChartsResponse } from '../../Interfaces/AdminInterfaces/admin-dashboard-charts-response';
import { AdminDashboardReviewsResponse } from '../../Interfaces/AdminInterfaces/admin-dashboard-reviews-response';
import { AdminDashboardQuickActionsResponse } from '../../Interfaces/AdminInterfaces/admin-dashboard-quick-actions-response';
import { ChartsRequest } from '../../Interfaces/Analyzer/charts-request';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  constructor(private readonly _http: HttpClient) {}

  buildParams(obj: ChartsRequest): HttpParams {
    let params = new HttpParams();
    (Object.keys(obj) as (keyof ChartsRequest)[]).forEach((key) => {
      const value = obj[key];
      if (value != null && value != undefined) {
        params = params.append(key, value);
      }
    });
    return params;
  }
  // Get Stats
  getStats(): Observable<ApplicationResult<AdminDashboardStatsResponse>> {
    return this._http.get<ApplicationResult<AdminDashboardStatsResponse>>(
      `${environment.apiUrl}/AdminDashboard/Stats`,
    );
  }

  // Get Charts
  getCharts(
    data: ChartsRequest,
  ): Observable<ApplicationResult<AdminDashboardChartsResponse>> {
    const params = this.buildParams(data);
    return this._http.get<ApplicationResult<AdminDashboardChartsResponse>>(
      `${environment.apiUrl}/AdminDashboard/Charts`,
      { params },
    );
  }

  // Get Lasted Reviews
  getLastedReview(): Observable<
    ApplicationResult<AdminDashboardReviewsResponse>
  > {
    return this._http.get<ApplicationResult<AdminDashboardReviewsResponse>>(
      `${environment.apiUrl}/AdminDashboard/Reviews`,
    );
  }
  // Get Quick Actions
  getQuickActions(): Observable<
    ApplicationResult<AdminDashboardQuickActionsResponse>
  > {
    return this._http.get<
      ApplicationResult<AdminDashboardQuickActionsResponse>
    >(`${environment.apiUrl}/AdminDashboard/Actions`);
  }
}
