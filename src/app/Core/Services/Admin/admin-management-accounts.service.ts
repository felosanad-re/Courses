import { AccountActionRequest } from './../../Interfaces/AdminInterfaces/account-action-request';
import { StudentParams } from './../../Interfaces/Instructors/student-params';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { Pagination } from '../../Interfaces/Courses/pagination';
import { AdminWithStudentResponse } from '../../Interfaces/AdminInterfaces/admin-with-student-response';
import { environment } from '../../../../environments/environment';
import { AdminWithStudentDetailsResponse } from '../../Interfaces/AdminInterfaces/admin-with-student-details-response';
import { InstructorParams } from '../../Interfaces/Instructors/instructor-params';
import { AdminInstructorResponse } from '../../Interfaces/AdminInterfaces/admin-instructor-response';
import { AdminInstructorDetailsResponse } from '../../Interfaces/AdminInterfaces/admin-instructor-details-response';

@Injectable({
  providedIn: 'root',
})
export class AdminManagementAccountsService {
  constructor(private readonly _http: HttpClient) {}

  buildParams(obj: any): HttpParams {
    let params = new HttpParams();

    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        params = params.append(key, value);
      }
    });

    return params;
  }

  getAllStudents(
    studentParams: StudentParams,
  ): Observable<ApplicationResult<Pagination<AdminWithStudentResponse[]>>> {
    const params = this.buildParams(studentParams);

    return this._http.get<
      ApplicationResult<Pagination<AdminWithStudentResponse[]>>
    >(`${environment.apiUrl}/AdminManagementAccounts/Students`, { params });
  }

  getStudentDetails(
    studentId: number,
  ): Observable<ApplicationResult<AdminWithStudentDetailsResponse>> {
    return this._http.get<ApplicationResult<AdminWithStudentDetailsResponse>>(
      `${environment.apiUrl}/AdminManagementAccounts/Student/${studentId}`,
    );
  }

  getAllInstructors(
    instructorParams: InstructorParams,
  ): Observable<ApplicationResult<Pagination<AdminInstructorResponse[]>>> {
    const params = this.buildParams(instructorParams);

    return this._http.get<
      ApplicationResult<Pagination<AdminInstructorResponse[]>>
    >(`${environment.apiUrl}/AdminManagementAccounts/Instructors`, { params });
  }

  getInstructorDetails(
    instructorId: number,
  ): Observable<ApplicationResult<AdminInstructorDetailsResponse>> {
    return this._http.get<ApplicationResult<AdminInstructorDetailsResponse>>(
      `${environment.apiUrl}/AdminManagementAccounts/Instructor/${instructorId}`,
    );
  }

  deleteAccount(
    userId: string,
    accountActionRequest: AccountActionRequest,
  ): Observable<ApplicationResult<boolean>> {
    return this._http.patch<ApplicationResult<boolean>>(
      `${environment.apiUrl}/AdminManagementAccounts/${userId}/Delete`,
      accountActionRequest,
    );
  }

  restoreAccount(userId: string): Observable<ApplicationResult<boolean>> {
    return this._http.patch<ApplicationResult<boolean>>(
      `${environment.apiUrl}/AdminManagementAccounts/${userId}/Restore`,
      {},
    );
  }

  suspendAccount(
    userId: string,
    accountActionRequest: AccountActionRequest,
  ): Observable<ApplicationResult<boolean>> {
    return this._http.patch<ApplicationResult<boolean>>(
      `${environment.apiUrl}/AdminManagementAccounts/${userId}/Suspend`,
      accountActionRequest,
    );
  }

  activateAccount(userId: string): Observable<ApplicationResult<boolean>> {
    return this._http.patch<ApplicationResult<boolean>>(
      `${environment.apiUrl}/AdminManagementAccounts/${userId}/Activate`,
      {},
    );
  }
}
