import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicationResult } from '../../Interfaces/application-result';
import { ApplyInstructorResponse } from '../../Interfaces/InstructorsRequest/apply-instructor-response';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Pagination } from '../../Interfaces/Courses/pagination';

@Injectable({
  providedIn: 'root',
})
export class AdminInstructorRequestService {
  constructor(private readonly _http: HttpClient) {}

  // Get All Requests
  getAllRequest(): Observable<
    ApplicationResult<Pagination<ApplyInstructorResponse[]>>
  > {
    return this._http.get<
      ApplicationResult<Pagination<ApplyInstructorResponse[]>>
    >(`${environment.apiUrl}/InstructorRequest/All`);
  }

  // Approve Request
  approveRequest(
    reqId: number,
  ): Observable<ApplicationResult<ApplyInstructorResponse>> {
    return this._http.put<ApplicationResult<ApplyInstructorResponse>>(
      `${environment.apiUrl}/InstructorRequest/Approve/${reqId}`,
      {},
    );
  }

  // Reject Request
  rejectRequest(
    reqId: number,
  ): Observable<ApplicationResult<ApplyInstructorResponse>> {
    return this._http.put<ApplicationResult<ApplyInstructorResponse>>(
      `${environment.apiUrl}/InstructorRequest/Reject/${reqId}`,
      {},
    );
  }
}
