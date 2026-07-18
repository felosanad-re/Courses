import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { CourseRatingResponse } from '../../Interfaces/Courses/course-rating-response';
import { CourseRatingRequest } from '../../Interfaces/Courses/course-rating-request';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RatingCoursesService {
  constructor(private readonly _http: HttpClient) {}

  createRating(
    courseId: number,
    ratingRequest: CourseRatingRequest,
  ): Observable<ApplicationResult<CourseRatingResponse>> {
    return this._http.post<ApplicationResult<CourseRatingResponse>>(
      `${environment.apiUrl}/RatingCourse/Rating/${courseId}`,
      ratingRequest,
    );
  }
}
