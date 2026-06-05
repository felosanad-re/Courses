import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { CreatedLectureRequest } from '../../Interfaces/Lectures/created-lecture-request';
import { LectureDeletedResponse } from '../../Interfaces/Lectures/lecture-deleted-response';
import { LectureWithInstructorResponse } from '../../Interfaces/Lectures/lecture-with-instructor-response';
import { UpdatedLectureRequest } from '../../Interfaces/Lectures/updated-lecture-request';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ManagementLectureService {
  constructor(private readonly _http: HttpClient) {}

  // Get Lecture by ID
  getLecture(
    lectureId: number,
  ): Observable<ApplicationResult<LectureWithInstructorResponse>> {
    return this._http.get<ApplicationResult<LectureWithInstructorResponse>>(
      `${environment.apiUrl}/ManagementLecture/${lectureId}`,
    );
  }

  // Create new Lecture
  createLecture(
    data: CreatedLectureRequest,
  ): Observable<ApplicationResult<LectureWithInstructorResponse>> {
    return this._http.post<ApplicationResult<LectureWithInstructorResponse>>(
      `${environment.apiUrl}/ManagementLecture/Create`,
      data,
    );
  }

  // Update Lecture
  updateLecture(
    data: UpdatedLectureRequest,
  ): Observable<ApplicationResult<LectureWithInstructorResponse>> {
    return this._http.put<ApplicationResult<LectureWithInstructorResponse>>(
      `${environment.apiUrl}/ManagementLecture/Update`,
      data,
    );
  }

  // delete lecture
  deleteLecture(
    id: number,
  ): Observable<ApplicationResult<LectureDeletedResponse>> {
    return this._http.delete<ApplicationResult<LectureDeletedResponse>>(
      `${environment.apiUrl}/ManagementLecture/${id}`,
    );
  }

  // delete lectures
  deleteLectures(
    ids: number[],
  ): Observable<ApplicationResult<LectureDeletedResponse>> {
    return this._http.post<ApplicationResult<LectureDeletedResponse>>(
      `${environment.apiUrl}/ManagementLecture/multi-delete`,
      ids,
    );
  }
}
