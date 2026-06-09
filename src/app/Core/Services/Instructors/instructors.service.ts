import { Pagination } from './../../Interfaces/Courses/pagination';
import { CoursesParams } from './../../Interfaces/Courses/courses-params';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { CourseResponseForInstructor } from '../../Interfaces/Instructors/course-response-for-instructor';
import { environment } from '../../../../environments/environment';
import { StudentParams } from '../../Interfaces/Instructors/student-params';
import { StudentWithInstructorResponse } from '../../Interfaces/Instructors/student-with-instructor-response';

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

  // Get All Students For Instructor
  getAllStudents(
    studentParams: StudentParams,
  ): Observable<
    ApplicationResult<Pagination<StudentWithInstructorResponse[]>>
  > {
    const params = this.buildCourseParams(studentParams);
    return this._http.get<
      ApplicationResult<Pagination<StudentWithInstructorResponse[]>>
    >(`${environment.apiUrl}/Instructor/Students`, { params });
  }
  // Get Student Details
  getStudentDetails(
    id: number,
  ): Observable<ApplicationResult<StudentWithInstructorResponse>> {
    return this._http.get<ApplicationResult<StudentWithInstructorResponse>>(
      `${environment.apiUrl}/Instructor/Student/${id}`,
    );
  }
}
