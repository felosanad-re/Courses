import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { InstructorStats } from '../../Interfaces/DashboardStats/instructor-stats';

@Injectable({
  providedIn: 'root',
})
export class InstructorDashboardStatsService {
  constructor(private readonly _http: HttpClient) {}

  // get instructor Status
  getStats(): Observable<ApplicationResult<InstructorStats>> {
    return this._http.get<ApplicationResult<InstructorStats>>(
      `${environment.apiUrl}/InstructorDashboard/Stats`,
    );
  }
}
