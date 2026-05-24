import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicationResult } from '../../Interfaces/application-result';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RefundRequest } from '../../Interfaces/Refunds/refund-request';
import { RefundResponse } from '../../Interfaces/Refunds/refund-response';

@Injectable({
  providedIn: 'root',
})
export class RefundsService {
  constructor(private readonly _http: HttpClient) {}

  createRefund(
    data: RefundRequest,
  ): Observable<ApplicationResult<RefundResponse>> {
    return this._http.post<ApplicationResult<RefundResponse>>(
      `${environment.apiUrl}/refunds/CreateRefund`,
      data,
    );
  }
}
