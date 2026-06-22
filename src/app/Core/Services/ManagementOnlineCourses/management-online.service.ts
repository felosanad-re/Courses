import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { LiveSessionRequest } from '../../Interfaces/LiveSessions/live-session-request';
import { LiveSessionDetailsResponse } from '../../Interfaces/LiveSessions/live-session-details-response';
import { LiveSessionListResponse } from '../../Interfaces/LiveSessions/live-session-list-response';
import { LiveSessionResponse } from '../../Interfaces/LiveSessions/live-session-response';
import { SectionWithSessionsResponse } from '../../Interfaces/LiveSessions/section-with-sessions-response';

@Injectable({
  providedIn: 'root',
})
export class ManagementOnlineService {
  constructor(private readonly _http: HttpClient) {}

  // Get Live Sessions
  getSessions(): Observable<ApplicationResult<LiveSessionListResponse[]>> {
    return this._http.get<ApplicationResult<LiveSessionListResponse[]>>(
      `${environment.apiUrl}/LiveSession/LiveSessions`,
    );
  }

  getSessionDetails(
    id: number,
  ): Observable<ApplicationResult<LiveSessionDetailsResponse>> {
    return this._http.get<ApplicationResult<LiveSessionDetailsResponse>>(
      `${environment.apiUrl}/LiveSession/${id}`,
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
    return this._http.put<ApplicationResult<LiveSessionResponse>>(
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
