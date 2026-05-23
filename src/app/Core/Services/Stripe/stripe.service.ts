import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { StripeClient } from '../../Interfaces/Stripe/stripe-client';
import { StripeElements } from '../../Interfaces/Stripe/stripe-elements';
import { StripePaymentElement } from '../../Interfaces/Stripe/stripe-payment-element';
import { StripePaymentResult } from '../../Interfaces/Stripe/stripe-payment-result';
import { StripeWindow } from '../../Interfaces/Stripe/stripe-window';

type StripeElementChangeEvent = {
  complete: boolean;
  error?: { message?: string };
};

type StripeAppearance = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripe: StripeClient | null = null;
  private scriptLoadPromise: Promise<void> | null = null;

  constructor(@Inject(PLATFORM_ID) private readonly _platformId: object) {}

  async getStripe(): Promise<StripeClient> {
    if (!isPlatformBrowser(this._platformId)) {
      throw new Error('Stripe can only be initialized in the browser.');
    }

    if (!environment.stripePublishableKey) {
      throw new Error('Stripe publishable key is not configured.');
    }

    if (this.stripe) {
      return this.stripe;
    }

    await this.loadStripeScript();

    const stripeFactory = (window as StripeWindow).Stripe;

    if (!stripeFactory) {
      throw new Error('Stripe failed to load.');
    }

    this.stripe = stripeFactory(environment.stripePublishableKey);
    return this.stripe;
  }

  async createElements(
    clientSecret: string,
    appearance?: StripeAppearance,
  ): Promise<StripeElements> {
    const stripe = await this.getStripe();

    return stripe.elements({
      clientSecret,
      appearance,
    });
  }

  createPaymentElement(
    elements: StripeElements,
    container: HTMLElement,
    onChange?: (event: StripeElementChangeEvent) => void,
  ): StripePaymentElement {
    const paymentElement = elements.create('payment');

    if (onChange) {
      paymentElement.on('change', onChange);
    }

    paymentElement.mount(container);
    return paymentElement;
  }

  confirmPayment(
    elements: StripeElements,
    returnUrl: string,
  ): Promise<StripePaymentResult> {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized.');
    }

    return this.stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: returnUrl,
      },
    });
  }

  unmountElement(element: StripePaymentElement | null): void {
    element?.unmount();
  }

  private loadStripeScript(): Promise<void> {
    if ((window as StripeWindow).Stripe) {
      return Promise.resolve();
    }

    if (this.scriptLoadPromise) {
      return this.scriptLoadPromise;
    }

    this.scriptLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load Stripe.'));
      document.head.appendChild(script);
    });

    return this.scriptLoadPromise;
  }
}
