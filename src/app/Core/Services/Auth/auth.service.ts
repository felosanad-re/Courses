import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest } from '../../Interfaces/Auth/login-request';
import { LoginResponse } from '../../Interfaces/login-response';
import { RegisterRequest } from '../../Interfaces/Auth/register-request';
import { RegisterResponse } from '../../Interfaces/Auth/register-response';
import { ConfirmRequest } from '../../Interfaces/Auth/confirm-request';
import { ConfirmResponse } from '../../Interfaces/Auth/confirm-response';
import { AccountRequest } from '../../Interfaces/Auth/account-request';
import { AccountResponse } from '../../Interfaces/Auth/account-response';
import { OTPRequest } from '../../Interfaces/Auth/otprequest';
import { OTPResponse } from '../../Interfaces/Auth/otp-response';
import { ForgetPasswordRequest } from '../../Interfaces/Auth/forget-password-request';
import { ForgetPasswordResponse } from '../../Interfaces/Auth/forget-password-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly _http: HttpClient) {}

  /** Login – POST /api/account/login */
  login(data: LoginRequest): Observable<LoginResponse> {
    return this._http.post<LoginResponse>(
      `${environment.apiUrl}/account/login`,
      data,
    );
  }

  /** Register – POST /api/account/register */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this._http.post<RegisterResponse>(
      `${environment.apiUrl}/account/register`,
      data,
    );
  }

  /** Confirm Account – POST /api/account/confirm-account */
  checkConfirm(data: ConfirmRequest): Observable<ConfirmResponse> {
    return this._http.post<ConfirmResponse>(
      `${environment.apiUrl}/account/confirm-account`,
      data,
    );
  }

  /** Check Account – POST /api/account/check-account */
  checkAccount(data: AccountRequest): Observable<AccountResponse> {
    return this._http.post<AccountResponse>(
      `${environment.apiUrl}/account/check-account`,
      data,
    );
  }

  /** Check OTP – POST /api/account/check-otp */
  checkOTP(data: OTPRequest): Observable<OTPResponse> {
    return this._http.post<OTPResponse>(
      `${environment.apiUrl}/account/check-otp`,
      data,
    );
  }

  /** Forget Password – POST /api/account/ResetPassword */
  forgetPassword(
    data: ForgetPasswordRequest,
  ): Observable<ForgetPasswordResponse> {
    return this._http.post<ForgetPasswordResponse>(
      `${environment.apiUrl}/account/ResetPassword`,
      data,
    );
  }
}
