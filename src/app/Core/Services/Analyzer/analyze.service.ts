import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { InstructorAnalyticsDto } from '../../Interfaces/Analyzer/instructor-analytics-dto';
import { MonthlyAnalyticsDto } from '../../Interfaces/Analyzer/monthly-analytics-dto';
import { ChartsRequest } from '../../Interfaces/Analyzer/charts-request';

@Injectable({
  providedIn: 'root',
})
export class AnalyzeService {
  constructor(private readonly _http: HttpClient) {}

  // Build Params
  buildParams(params: any): HttpParams {
    let param = new HttpParams();

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        param = param.append(key, value);
      }
    });

    return param;
  }
  // Get Analyze
  getAnalyze(): Observable<ApplicationResult<InstructorAnalyticsDto>> {
    return this._http.get<ApplicationResult<InstructorAnalyticsDto>>(
      `${environment.apiUrl}/Analytics/Analyze`,
    );
  }

  getAnalyzeCharts(
    data: ChartsRequest,
  ): Observable<ApplicationResult<MonthlyAnalyticsDto[]>> {
    const params = this.buildParams(data);
    return this._http.get<ApplicationResult<MonthlyAnalyticsDto[]>>(
      `${environment.apiUrl}/Analytics/AnalyzeCharts`,
      { params },
    );
  }
}
