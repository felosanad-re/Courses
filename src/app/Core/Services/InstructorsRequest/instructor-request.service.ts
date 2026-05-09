import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { ApplyInstructorRequest } from '../../Interfaces/InstructorsRequest/apply-instructor-request';
import { ApplyInstructorResponse } from '../../Interfaces/InstructorsRequest/apply-instructor-response';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InstructorRequestService {
  constructor(private readonly _http: HttpClient) {}

  // Apply Request
  applyRequest(
    data: ApplyInstructorRequest,
  ): Observable<ApplicationResult<ApplyInstructorResponse>> {
    return this._http.post<ApplicationResult<ApplyInstructorResponse>>(
      `${environment.apiUrl}/InstructorRequest/Apply`,
      data,
    );
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
  // Get All Requests
  getAllRequest(): Observable<ApplicationResult<ApplyInstructorResponse[]>> {
    return this._http.get<ApplicationResult<ApplyInstructorResponse[]>>(
      `${environment.apiUrl}/InstructorRequest/All`,
    );
  }
}
