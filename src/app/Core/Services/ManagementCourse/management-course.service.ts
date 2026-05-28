import { HttpClient } from '@angular/common/http';
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
export class ManagementCourseService {
  constructor(private readonly _http: HttpClient) {}

  // Get Course Details
  getCourseDetails(
    id: number,
  ): Observable<ApplicationResult<CourseResponseForInstructor>> {
    return this._http.get<ApplicationResult<CourseResponseForInstructor>>(
      `${environment.apiUrl}/ManagementCourse/Course/${id}`,
    );
  }

  // Add Course
  addCourse(
    data: CreatedCourseRequest,
  ): Observable<ApplicationResult<CourseResponseForInstructor>> {
    return this._http.post<ApplicationResult<CourseResponseForInstructor>>(
      `${environment.apiUrl}/ManagementCourse/CreateCourse`,
      data,
    );
  }

  // Update Course
  updateCourse(
    data: UpdatedCourseRequest,
    id: number,
  ): Observable<ApplicationResult<CourseResponseForInstructor>> {
    return this._http.put<ApplicationResult<CourseResponseForInstructor>>(
      `${environment.apiUrl}/ManagementCourse/UpdateCourse/${id}`,
      data,
    );
  }

  // Delete course
  deleteCourse(id: number): Observable<ApplicationResult<boolean>> {
    return this._http.delete<ApplicationResult<boolean>>(
      `${environment.apiUrl}/ManagementCourse/Delete/${id}`,
    );
  }

  // Delete multiple courses
  deleteCourses(
    ids: number[],
  ): Observable<ApplicationResult<DeleteCoursesResult>> {
    return this._http.post<ApplicationResult<DeleteCoursesResult>>(
      `${environment.apiUrl}/ManagementCourse/Delete-Courses`,
      ids,
    );
  }
}
