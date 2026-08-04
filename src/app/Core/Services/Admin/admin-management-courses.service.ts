import { CourseDetailsToReturnDTO } from './../../Interfaces/Courses/course-details-to-return-dto';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { Pagination } from '../../Interfaces/Courses/pagination';
import { CourseType } from './../../Interfaces/Courses/course-type';
import { CoursesParams } from './../../Interfaces/Courses/courses-params';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdminCoursesResponse } from '../../Interfaces/AdminInterfaces/admin-courses-response';
import { environment } from '../../../../environments/environment';
import { UpdateCourseStatusRequest } from '../../Interfaces/AdminInterfaces/update-course-status-request';
import { CourseStatus } from '../../Interfaces/Courses/course-status';

@Injectable({
  providedIn: 'root',
})
export class AdminManagementCoursesService {
  constructor(private readonly _http: HttpClient) {}

  buildCourseParams(courseParams: CoursesParams): HttpParams {
    let params = new HttpParams();
    (Object.keys(courseParams) as (keyof CoursesParams)[]).forEach((key) => {
      const value = courseParams[key];
      if (value != null && value != undefined) {
        params = params.append(key, value);
      }
    });

    return params;
  }
  // Get Courses
  getCourses(
    coursesParams: CoursesParams,
    courseType?: CourseType,
    courseStats?: CourseStatus,
  ): Observable<ApplicationResult<Pagination<AdminCoursesResponse[]>>> {
    var params = this.buildCourseParams(coursesParams);

    if (courseType != null && courseType != undefined) {
      params = params.append('type', courseType);
    }

    if (courseStats != null && courseStats != undefined) {
      params = params.append('status', courseStats);
    }

    return this._http.get<
      ApplicationResult<Pagination<AdminCoursesResponse[]>>
    >(`${environment.apiUrl}/AdminManagementCourses/Courses`, { params });
  }

  // Get Course Details
  getCourseDetails(
    courseId: number,
    courseType: CourseType,
  ): Observable<ApplicationResult<CourseDetailsToReturnDTO>> {
    var param = new HttpParams().append('type', courseType);
    return this._http.get<ApplicationResult<CourseDetailsToReturnDTO>>(
      `${environment.apiUrl}/AdminManagementCourses/Course/${courseId}`,
      { params: param },
    );
  }

  // Update Course Status
  updateCourseStatus(
    courseId: number,
    updateCourseStatusRequest: UpdateCourseStatusRequest,
  ): Observable<ApplicationResult<boolean>> {
    return this._http.patch<ApplicationResult<boolean>>(
      `${environment.apiUrl}/AdminManagementCourses/${courseId}/status`,
      updateCourseStatusRequest,
    );
  }

  // Delete Course
  deleteCourse(courseId: number): Observable<ApplicationResult<boolean>> {
    return this._http.delete<ApplicationResult<boolean>>(
      `${environment.apiUrl}/AdminManagementCourses/${courseId}`,
    );
  }
}
