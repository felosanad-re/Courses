import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicationResult } from '../../Interfaces/application-result';
import { ApplyInstructorResponse } from '../../Interfaces/InstructorsRequest/apply-instructor-response';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Pagination } from '../../Interfaces/Courses/pagination';
import { InstructorRequestParams } from '../../Interfaces/AdminInterfaces/instructor-request-params';
import { ApplyInstructorDetailsResponse } from '../../Interfaces/InstructorsRequest/apply-instructor-details-response';

@Injectable({
  providedIn: 'root',
})
export class AdminInstructorRequestService {
  constructor(private readonly _http: HttpClient) {}

  buildParams(obj: InstructorRequestParams): HttpParams {
    let params = new HttpParams();

    (Object.keys(obj) as (keyof InstructorRequestParams)[]).forEach((key) => {
      const value = obj[key];
      if (value != null && value != undefined)
        params = params.append(key, value);
    });

    return params;
  }

  // Get All Requests
  getAllRequest(
    param: InstructorRequestParams,
  ): Observable<ApplicationResult<Pagination<ApplyInstructorResponse[]>>> {
    const params = this.buildParams(param);
    return this._http.get<
      ApplicationResult<Pagination<ApplyInstructorResponse[]>>
    >(`${environment.apiUrl}/AdminInstructorRequest`, { params });
  }

  getRequestDetails(
    reqId: number,
  ): Observable<ApplicationResult<ApplyInstructorDetailsResponse>> {
    return this._http.get<ApplicationResult<ApplyInstructorDetailsResponse>>(
      `${environment.apiUrl}/AdminInstructorRequest/${reqId}`,
    );
  }

  // Approve Request
  approveRequest(reqId: number): Observable<ApplicationResult<boolean>> {
    return this._http.post<ApplicationResult<boolean>>(
      `${environment.apiUrl}/AdminInstructorRequest/Approve/${reqId}`,
      {},
    );
  }

  // Reject Request
  rejectRequest(reqId: number): Observable<ApplicationResult<boolean>> {
    return this._http.post<ApplicationResult<boolean>>(
      `${environment.apiUrl}/AdminInstructorRequest/Rejected/${reqId}`,
      {},
    );
  }
}
