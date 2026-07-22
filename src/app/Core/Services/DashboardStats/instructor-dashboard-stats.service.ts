import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { InstructorStats } from '../../Interfaces/DashboardStats/instructor-stats';
import { Review } from '../../Interfaces/DashboardStats/review';
import { Pagination } from '../../Interfaces/Courses/pagination';
import { RatingParams } from '../../Interfaces/DashboardStats/rating-params';

@Injectable({
  providedIn: 'root',
})
export class InstructorDashboardStatsService {
  constructor(private readonly _http: HttpClient) {}

  private buildRatingParams(obj: RatingParams): HttpParams {
    let params = new HttpParams();

    (Object.keys(obj) as (keyof RatingParams)[]).forEach((key) => {
      const value = obj[key];
      if (value != null && value != undefined) {
        params = params.append(key, value);
      }
    });
    return params;
  }
  // get instructor Status
  getStats(): Observable<ApplicationResult<InstructorStats>> {
    return this._http.get<ApplicationResult<InstructorStats>>(
      `${environment.apiUrl}/InstructorDashboard/Stats`,
    );
  }

  getReviews(
    ratingParams: RatingParams,
  ): Observable<ApplicationResult<Pagination<Review[]>>> {
    const params = this.buildRatingParams(ratingParams);
    return this._http.get<ApplicationResult<Pagination<Review[]>>>(
      `${environment.apiUrl}/InstructorDashboard/Reviews`,
      { params },
    );
  }
}
