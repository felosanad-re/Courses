import { StripePaymentElement } from './stripe-payment-element';

export interface StripeElements {
  create(type: 'payment'): StripePaymentElement;
}
