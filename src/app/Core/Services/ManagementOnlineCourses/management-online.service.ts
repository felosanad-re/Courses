import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { LiveSessionRequest } from '../../Interfaces/LiveSessions/live-session-request';
import { LiveSessionDetailsResponse } from '../../Interfaces/LiveSessions/live-session-details-response';
import { LiveSessionListResponse } from '../../Interfaces/LiveSessions/live-session-list-response';
import { LiveSessionResponse } from '../../Interfaces/LiveSessions/live-session-response';
import { SectionWithSessionsResponse } from '../../Interfaces/LiveSessions/section-with-sessions-response';
import { LiveSessionStatisticsResponse } from '../../Interfaces/LiveSessions/live-session-statistics-response';
import { SessionParams } from '../../Interfaces/LiveSessions/session-params';
import { Pagination } from '../../Interfaces/Courses/pagination';

@Injectable({
  providedIn: 'root',
})
export class ManagementOnlineService {
  constructor(private readonly _http: HttpClient) {}

  buildSessionsParams(params: SessionParams): HttpParams {
    var httpParams = new HttpParams();
    (Object.keys(params) as (keyof SessionParams)[]).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        httpParams = httpParams.append(key, value as string);
      }
    });
    return httpParams;
  }

  // Get Live Sessions
  getSessions(
    sessionParams: SessionParams,
  ): Observable<ApplicationResult<Pagination<LiveSessionListResponse[]>>> {
    const params = this.buildSessionsParams(sessionParams);
    return this._http.get<
      ApplicationResult<Pagination<LiveSessionListResponse[]>>
    >(`${environment.apiUrl}/LiveSession/LiveSessions`, { params });
  }

  getSessionDetails(
    id: number,
  ): Observable<ApplicationResult<LiveSessionDetailsResponse>> {
    return this._http.get<ApplicationResult<LiveSessionDetailsResponse>>(
      `${environment.apiUrl}/LiveSession/${id}`,
    );
  }

  getSessionStatus(): Observable<
    ApplicationResult<LiveSessionStatisticsResponse>
  > {
    return this._http.get<ApplicationResult<LiveSessionStatisticsResponse>>(
      `${environment.apiUrl}/LiveSession/LiveSessionStats`,
    );
  }

  getSectionsWithSessions(
    courseId: number,
  ): Observable<ApplicationResult<SectionWithSessionsResponse[]>> {
    return this._http.get<ApplicationResult<SectionWithSessionsResponse[]>>(
      `${environment.apiUrl}/LiveSession/Sections/Sessions/${courseId}`,
    );
  }

  createSession(
    liveSessionReq: LiveSessionRequest,
  ): Observable<ApplicationResult<LiveSessionResponse>> {
    return this._http.post<ApplicationResult<LiveSessionResponse>>(
      `${environment.apiUrl}/LiveSession/CreateSession`,
      liveSessionReq,
    );
  }

  updateSession(
    liveSessionRequest: LiveSessionRequest,
    id: number,
  ): Observable<ApplicationResult<LiveSessionResponse>> {
    return this._http.post<ApplicationResult<LiveSessionResponse>>(
      `${environment.apiUrl}/LiveSession/UpdateLiveSession/${id}`,
      liveSessionRequest,
    );
  }

  deleteSession(id: number): Observable<ApplicationResult<boolean>> {
    return this._http.delete<ApplicationResult<boolean>>(
      `${environment.apiUrl}/LiveSession/DeleteSession/${id}`,
    );
  }
}
