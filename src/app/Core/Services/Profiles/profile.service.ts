import { EditProfileRequest } from './../../Interfaces/Profiles/edit-profile-request';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { UserProfileResponse } from '../../Interfaces/Profiles/user-profile-response';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private readonly _http: HttpClient) {}

  getProfileDetails(): Observable<ApplicationResult<UserProfileResponse>> {
    return this._http.get<ApplicationResult<UserProfileResponse>>(
      `${environment.apiUrl}/profile`,
    );
  }

  editProfile(
    userId: string,
    data: EditProfileRequest,
  ): Observable<ApplicationResult<UserProfileResponse>> {
    return this._http.post<ApplicationResult<UserProfileResponse>>(
      `${environment.apiUrl}/Profile/Edit/${userId}`,
      data,
    );
  }
}
