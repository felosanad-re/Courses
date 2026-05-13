import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { EnrollmentRequest } from '../../Interfaces/Enrollments/enrollment-request';
import { EnrollmentWithCourseResponse } from '../../Interfaces/Enrollments/enrollment-with-course-response';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  constructor(private readonly _http: HttpClient) {}

  createEnrollment(
    data: EnrollmentRequest,
  ): Observable<ApplicationResult<EnrollmentWithCourseResponse>> {
    return this._http.post<ApplicationResult<EnrollmentWithCourseResponse>>(
      `${environment.apiUrl}/Enrollment/CreateEnrollment`,
      data,
    );
  }
}
