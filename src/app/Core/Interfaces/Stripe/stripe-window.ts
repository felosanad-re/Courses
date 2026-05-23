import { StripeClient } from './stripe-client';

export interface StripeWindow {
  Stripe?: (publishableKey: string) => StripeClient;
}
