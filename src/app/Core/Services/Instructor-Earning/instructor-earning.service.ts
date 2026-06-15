import { EnrollmentsParams } from './../../Interfaces/Earnings/enrollments-params';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../Interfaces/Courses/pagination';
import { InstructorWithEnrollmentsDetails } from '../../Interfaces/Earnings/instructor-with-enrollments-details';
import { InstructorEarningStatsResponse } from '../../Interfaces/Earnings/instructor-earning-stats-response';

@Injectable({
  providedIn: 'root',
})
export class InstructorEarningService {
  constructor(private readonly _http: HttpClient) {}
  // Build Params
  buildEnrollmentParams(enrollmentParams: any): HttpParams {
    let params = new HttpParams();
    Object.keys(enrollmentParams).forEach((key) => {
      const value = enrollmentParams[key];
      if (value !== null && value !== undefined) {
        params = params.append(key, value);
      }
    });
    return params;
  }

  getEarningStats(
    fromDate?: string,
    toDate?: string,
  ): Observable<ApplicationResult<InstructorEarningStatsResponse>> {
    let params = new HttpParams();
    if (fromDate) {
      params = params.append('fromDate', fromDate);
    }
    if (toDate) {
      params = params.append('toDate', toDate);
    }
    return this._http.get<ApplicationResult<InstructorEarningStatsResponse>>(
      `${environment.apiUrl}/Earning/Stats`,
      { params },
    );
  }

  getInstructorEnrollments(
    enrollmentsParams: EnrollmentsParams,
  ): Observable<
    ApplicationResult<Pagination<InstructorWithEnrollmentsDetails[]>>
  > {
    return this._http.get<
      ApplicationResult<Pagination<InstructorWithEnrollmentsDetails[]>>
    >(`${environment.apiUrl}/Earning/enrollments`, {
      params: this.buildEnrollmentParams(enrollmentsParams),
    });
  }
}
