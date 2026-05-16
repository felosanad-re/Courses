import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { CourseProgressResponse } from '../../Interfaces/Progresses/course-progress-response';
import { UpdateAndAddProgressRequest } from '../../Interfaces/Progresses/update-and-add-progress-request';
import { ProgressWithLectureResponse } from '../../Interfaces/Progresses/progress-with-lecture-response';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  constructor(private readonly _http: HttpClient) {}

  // Get Lecture Progress
  getLectureProgress(
    lectureId: number,
  ): Observable<ApplicationResult<ProgressWithLectureResponse>> {
    return this._http.get<ApplicationResult<ProgressWithLectureResponse>>(
      `${environment.apiUrl}/Progress/StudentProgress/${lectureId}`,
    );
  }

  // Add And Update Lecture Progress
  addOrUpdateProgress(
    progress: UpdateAndAddProgressRequest,
  ): Observable<ApplicationResult<ProgressWithLectureResponse>> {
    return this._http.post<ApplicationResult<ProgressWithLectureResponse>>(
      `${environment.apiUrl}/Progress/UpdateProgress`,
      progress,
    );
  }

  // Get Course Progress
  getCourseProgress(
    courseId: number,
  ): Observable<ApplicationResult<CourseProgressResponse>> {
    return this._http.get<ApplicationResult<CourseProgressResponse>>(
      `${environment.apiUrl}/Progress/CourseProgress/${courseId}`,
    );
  }
}
