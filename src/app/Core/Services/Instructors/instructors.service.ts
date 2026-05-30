import { Pagination } from './../../Interfaces/Courses/pagination';
import { CoursesParams } from './../../Interfaces/Courses/courses-params';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { CourseResponseForInstructor } from '../../Interfaces/Instructors/course-response-for-instructor';
import { environment } from '../../../../environments/environment';
import { CreatedCourseRequest } from '../../Interfaces/Instructors/created-course-request';
import { UpdatedCourseRequest } from '../../Interfaces/Instructors/updated-course-request';
import { DeleteCoursesResult } from '../../Interfaces/Instructors/delete-courses-result';

@Injectable({
  providedIn: 'root',
})
export class InstructorsService {
  constructor(private readonly _http: HttpClient) {}

  // build params
  buildCourseParams(courseParam: any): HttpParams {
    let params = new HttpParams();
    Object.keys(courseParam).forEach((key) => {
      const value = courseParam[key];
      if (value !== null && value !== undefined) {
        params = params.append(key, value);
      }
    });
    return params;
  }

  // Get All Courses
  getAllCourses(
    courseParams: CoursesParams,
  ): Observable<ApplicationResult<Pagination<CourseResponseForInstructor[]>>> {
    const params = this.buildCourseParams(courseParams);
    return this._http.get<
      ApplicationResult<Pagination<CourseResponseForInstructor[]>>
    >(`${environment.apiUrl}/Instructor/Courses`, { params });
  }
}
