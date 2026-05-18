import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { PaymentRequest } from '../../Interfaces/Payments/payment-request';
import { PaymentResponse } from '../../Interfaces/Payments/payment-response';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private readonly _http: HttpClient) {}

  // Create PaymentIntent
  createPaymentIntent(
    data: PaymentRequest,
  ): Observable<ApplicationResult<PaymentResponse>> {
    return this._http.post<ApplicationResult<PaymentResponse>>(
      `${environment.apiUrl}/Payment/CreatePaymentIntent`,
      data,
    );
  }

  // Get/Verify PaymentIntent status from backend (calls Stripe to check)
  getPaymentIntent(
    paymentIntentId: string,
  ): Observable<ApplicationResult<PaymentResponse>> {
    return this._http.get<ApplicationResult<PaymentResponse>>(
      `${environment.apiUrl}/Payment/PaymentIntent`,
      { params: { paymentIntentId } },
    );
  }
}
