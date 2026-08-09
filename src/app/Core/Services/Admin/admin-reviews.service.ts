import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { Pagination } from '../../Interfaces/Courses/pagination';
import { environment } from '../../../../environments/environment';
import { AdminReviewDetailsResponse } from '../../Interfaces/AdminInterfaces/admin-review-details-response';
import { AdminReviewsResponse } from '../../Interfaces/AdminInterfaces/admin-reviews-response';
import { ReviewsParams } from '../../Interfaces/AdminInterfaces/reviews-params';

@Injectable({
  providedIn: 'root',
})
export class AdminReviewsService {
  constructor(private readonly _http: HttpClient) {}

  buildParams(obj: ReviewsParams): HttpParams {
    let param = new HttpParams();

    (Object.keys(obj) as (keyof ReviewsParams)[]).forEach((key) => {
      const value = obj[key];
      if (value != null && value != undefined) param = param.append(key, value);
    });
    return param;
  }

  getAllReviews(
    param: ReviewsParams,
  ): Observable<ApplicationResult<Pagination<AdminReviewsResponse[]>>> {
    const params = this.buildParams(param);
    return this._http.get<
      ApplicationResult<Pagination<AdminReviewsResponse[]>>
    >(`${environment.apiUrl}/AdminReviews/Reviews`, { params });
  }

  getReviewDetails(
    reviewId: number,
  ): Observable<ApplicationResult<AdminReviewDetailsResponse>> {
    return this._http.get<ApplicationResult<AdminReviewDetailsResponse>>(
      `${environment.apiUrl}/AdminReviews/Review/${reviewId}`,
    );
  }

  deleteReview(reviewId: number): Observable<ApplicationResult<boolean>> {
    return this._http.delete<ApplicationResult<boolean>>(
      `${environment.apiUrl}/AdminReviews/${reviewId}/Review`,
    );
  }
}
