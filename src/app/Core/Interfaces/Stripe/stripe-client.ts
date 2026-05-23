import { StripeElements } from './stripe-elements';
import { StripePaymentResult } from './stripe-payment-result';

export interface StripeClient {
  elements(options: {
    clientSecret: string;
    appearance?: Record<string, unknown>;
  }): StripeElements;
  confirmPayment(options: {
    elements: StripeElements;
    redirect: 'if_required';
    confirmParams: { return_url: string };
  }): Promise<StripePaymentResult>;
}
