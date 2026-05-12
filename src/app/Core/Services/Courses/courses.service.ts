import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CoursesParams } from '../../Interfaces/Courses/courses-params';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { CoursesToReturnDTO } from '../../Interfaces/Courses/courses-to-return-dto';
import { Pagination } from '../../Interfaces/Courses/pagination';
import { env } from 'process';
import { environment } from '../../../../environments/environment';
import { CourseDetailsToReturnDTO } from '../../Interfaces/Courses/course-details-to-return-dto';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  constructor(private readonly _http: HttpClient) {}

  // build courses params
  BuildCoursesParams(coursesParams: any): HttpParams {
    let params = new HttpParams();
    Object.keys(coursesParams).forEach((key) => {
      const value = coursesParams[key];
      if (value !== null && value !== undefined) {
        params = params.append(key, value);
      }
    });

    return params;
  }

  // Get All Courses
  getAllCourses(
    coursesParams: CoursesParams,
  ): Observable<ApplicationResult<Pagination<CoursesToReturnDTO[]>>> {
    const params = this.BuildCoursesParams(coursesParams);
    return this._http.get<ApplicationResult<Pagination<CoursesToReturnDTO[]>>>(
      `${environment.apiUrl}/courses/courses`,
      { params },
    );
  }

  getCourseDetails(
    courseId: number,
  ): Observable<ApplicationResult<CourseDetailsToReturnDTO>> {
    return this._http.get<ApplicationResult<CourseDetailsToReturnDTO>>(
      `${environment.apiUrl}/courses/Course/${courseId}`,
    );
  }
}
