import { ApplicationResult } from './../../Interfaces/application-result';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest } from '../../Interfaces/Auth/login-request';
import { LoginResponse } from '../../Interfaces/login-response';
import { RegisterRequest } from '../../Interfaces/Auth/register-request';
import { RegisterResponse } from '../../Interfaces/Auth/register-response';
import { ConfirmResponse } from '../../Interfaces/Auth/confirm-response';
import { AccountRequest } from '../../Interfaces/Auth/account-request';
import { AccountResponse } from '../../Interfaces/Auth/account-response';
import { OTPRequest } from '../../Interfaces/Auth/otprequest';
import { OTPResponse } from '../../Interfaces/Auth/otp-response';
import { ForgetPasswordRequest } from '../../Interfaces/Auth/forget-password-request';
import { ForgetPasswordResponse } from '../../Interfaces/Auth/forget-password-response';
import { CheckEmailConfirmationRequest } from '../../Interfaces/Auth/check-email-confirmation-request';
import { CheckEmailConfirmationResponse } from '../../Interfaces/Auth/check-email-confirmation-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly _http: HttpClient) {}

  /** Login – POST /api/account/login */
  login(data: LoginRequest): Observable<ApplicationResult<LoginResponse>> {
    return this._http.post<ApplicationResult<LoginResponse>>(
      `${environment.apiUrl}/account/login`,
      data,
    );
  }

  /** Register – POST /api/account/register */
  register(
    data: RegisterRequest,
  ): Observable<ApplicationResult<RegisterResponse>> {
    return this._http.post<ApplicationResult<RegisterResponse>>(
      `${environment.apiUrl}/account/register`,
      data,
    );
  }

  /** Confirm Account – GET /api/account/confirm?userId=...&token=... */
  confirmAccount(
    userId: string,
    token: string,
  ): Observable<ApplicationResult<ConfirmResponse>> {
    return this._http.get<ApplicationResult<ConfirmResponse>>(
      `${environment.apiUrl}/account/confirm`,
      {
        params: { userId, token },
      },
    );
  }

  /** Check Account – POST /api/account/checkAccount */
  checkAccount(
    data: AccountRequest,
  ): Observable<ApplicationResult<AccountResponse>> {
    return this._http.post<ApplicationResult<AccountResponse>>(
      `${environment.apiUrl}/account/checkAccount`,
      data,
    );
  }

  /** Check OTP – POST /api/account/CheckOTP */
  checkOTP(data: OTPRequest): Observable<ApplicationResult<OTPResponse>> {
    return this._http.post<ApplicationResult<OTPResponse>>(
      `${environment.apiUrl}/account/CheckOTP`,
      data,
    );
  }

  /** Forget Password – POST /api/account/ResetPassword */
  forgetPassword(
    data: ForgetPasswordRequest,
  ): Observable<ApplicationResult<ForgetPasswordResponse>> {
    return this._http.post<ApplicationResult<ForgetPasswordResponse>>(
      `${environment.apiUrl}/account/ResetPassword`,
      data,
    );
  }

  /** Check Email Confirmation – POST /api/account/check-email-confirmation */
  checkEmailConfirmation(
    data: CheckEmailConfirmationRequest,
  ): Observable<ApplicationResult<CheckEmailConfirmationResponse>> {
    return this._http.post<ApplicationResult<CheckEmailConfirmationResponse>>(
      `${environment.apiUrl}/account/CheckEmailConfirmation`,
      data,
    );
  }
}
