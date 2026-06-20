import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { SectionWithCourseResponse } from '../../Interfaces/Courses/section-with-course-response';
import { CourseWithLectureVideoResponse } from '../../Interfaces/Courses/course-with-lecture-video-response';
import { EnrollmentWithCoursesResponse } from '../../Interfaces/Enrollments/enrollment-with-courses-response';
import { SectionWithSessionsResponse } from '../../Interfaces/LiveSessions/section-with-sessions-response';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private readonly _http: HttpClient) {}

  // Get Student Courses
  getStudentCourses(): Observable<
    ApplicationResult<EnrollmentWithCoursesResponse[]>
  > {
    return this._http.get<ApplicationResult<EnrollmentWithCoursesResponse[]>>(
      `${environment.apiUrl}/Student/Courses`,
    );
  }

  // Get Course Sections
  getSections(
    courseId: number,
  ): Observable<ApplicationResult<SectionWithCourseResponse[]>> {
    return this._http.get<ApplicationResult<SectionWithCourseResponse[]>>(
      `${environment.apiUrl}/Courses/Sections/${courseId}`,
    );
  }

  // Get Lectures in section
  getVideoInLecture(
    lectureId: number,
  ): Observable<ApplicationResult<CourseWithLectureVideoResponse>> {
    return this._http.get<ApplicationResult<CourseWithLectureVideoResponse>>(
      `${environment.apiUrl}/Courses/Lecture/${lectureId}/Video`,
    );
  }

  // Get Sections With Sessions
  getSectionsWithSessions(
    courseId: number,
  ): Observable<ApplicationResult<SectionWithSessionsResponse[]>> {
    return this._http.get<ApplicationResult<SectionWithSessionsResponse[]>>(
      `${environment.apiUrl}/LiveSession/Sections/Sessions/${courseId}`,
    );
  }
}
