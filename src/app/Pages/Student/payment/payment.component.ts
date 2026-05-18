import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../Core/Services/Payments/payment.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { PaymentResponse } from '../../../Core/Interfaces/Payments/payment-response';
import { environment } from '../../../../environments/environment';

type StripePaymentResult = {
  error?: { message?: string };
  paymentIntent?: { status?: string };
};

interface StripePaymentElement {
  mount(element: HTMLElement): void;
  unmount(): void;
  on(
    eventName: 'change',
    callback: (event: {
      complete: boolean;
      error?: { message?: string };
    }) => void,
  ): void;
}

interface StripeElements {
  create(type: 'payment'): StripePaymentElement;
}

interface StripeClient {
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

interface StripeWindow extends Window {
  Stripe?: (publishableKey: string) => StripeClient;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('paymentElement') paymentElementRef?: ElementRef<HTMLElement>;

  enrollmentId!: number;
  clientSecret: string | null = null;
  isLoading = false;
  isSubmitting = false;
  paymentReady = false;
  paymentError: string | null = null;

  private stripe: StripeClient | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _paymentService: PaymentService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
    @Inject(PLATFORM_ID) private readonly _platformId: object,
  ) {}

  ngOnInit(): void {
    this.enrollmentId = Number(
      this._route.snapshot.paramMap.get('enrollmentId'),
    );

    if (!this.enrollmentId) {
      this.paymentError = 'Invalid enrollment.';
      this._notifications.showError(this.paymentError, 'Payment');
      this._router.navigate(['/student', 'home']);
      return;
    }

    this.createPaymentIntent();
  }

  ngOnDestroy(): void {
    this.paymentElement?.unmount();
  }

  createPaymentIntent(): void {
    this.isLoading = true;
    this.paymentError = null;

    this._paymentService
      .createPaymentIntent({ enrollmentId: this.enrollmentId })
      .subscribe({
        next: (res: ApplicationResult<PaymentResponse>) => {
          const clientSecret = this.getClientSecret(res.data);

          if (!res.succeed || !clientSecret) {
            this.paymentError =
              res.message || 'Unable to start payment. Please try again.';
            this._notifications.showError(this.paymentError, 'Payment');
            this.isLoading = false;
            return;
          }

          this.clientSecret = clientSecret;
          void this.initializeStripe(clientSecret);
        },
      });
  }

  async confirmPayment(): Promise<void> {
    if (!this.stripe || !this.elements || !this.paymentReady) {
      this.paymentError = 'Please complete your payment details first.';
      return;
    }

    this.isSubmitting = true;
    this.paymentError = null;

    const result = await this.stripe.confirmPayment({
      elements: this.elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/student/my-courses`,
      },
    });

    // If Stripe redirected the user (3D Secure), we won't reach this code.
    // The PaymentReturnComponent will handle the redirect instead.
    this.isSubmitting = false;

    if (result.error) {
      this.paymentError = result.error.message || 'Payment failed.';
      this._notifications.showError(this.paymentError, 'Payment');
      return;
    }

    // Payment succeeded without redirect — verify with backend
    const paymentIntentId = this.extractPaymentIntentId(this.clientSecret!);

    if (paymentIntentId) {
      this.verifyWithBackend(paymentIntentId);
    } else {
      this.paymentError =
        'Payment verification failed. Please contact support.';
      this._notifications.showError(this.paymentError, 'Payment');
    }
  }

  goBack(): void {
    this._router.navigate(['/student', 'home']);
  }

  private extractPaymentIntentId(clientSecret: string): string {
    // Stripe clientSecret format: "pi_xxx_secret_xxx"
    return clientSecret.split('_secret_')[0];
  }

  private verifyWithBackend(paymentIntentId: string): void {
    this._paymentService.getPaymentIntent(paymentIntentId).subscribe({
      next: (res: ApplicationResult<PaymentResponse>) => {
        this.isSubmitting = false;

        if (res.succeed && res.data?.status === 'PaymentSucceeded') {
          this._notifications.showSuccess(
            'Payment completed successfully.',
            'Payment',
          );
          this._router.navigate(['/student', 'my-courses']);
        } else {
          this.paymentError =
            res.message ||
            'Payment verification failed. Please contact support.';
          this._notifications.showError(this.paymentError, 'Payment');
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.paymentError =
          'Unable to verify payment with server. Please contact support.';
        this._notifications.showError(this.paymentError, 'Payment');
      },
    });
  }

  private async initializeStripe(clientSecret: string): Promise<void> {
    if (!isPlatformBrowser(this._platformId)) {
      this.isLoading = false;
      return;
    }

    if (!environment.stripePublishableKey) {
      this.paymentError = 'Stripe publishable key is not configured.';
      this._notifications.showError(this.paymentError, 'Payment');
      this.isLoading = false;
      return;
    }

    try {
      await this.loadStripeScript();
      const stripeFactory = (window as StripeWindow).Stripe;

      if (!stripeFactory || !this.paymentElementRef) {
        throw new Error('Stripe failed to load.');
      }

      this.stripe = stripeFactory(environment.stripePublishableKey);
      this.elements = this.stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            borderRadius: '8px',
            colorPrimary: '#2563eb',
          },
        },
      });

      this.paymentElement = this.elements.create('payment');
      this.paymentElement.on('change', (event) => {
        this.paymentReady = event.complete;
        this.paymentError = event.error?.message || null;
      });
      this.paymentElement.mount(this.paymentElementRef.nativeElement);
    } catch {
      this.paymentError = 'Unable to load Stripe. Please try again.';
      this._notifications.showError(this.paymentError, 'Payment');
    } finally {
      this.isLoading = false;
    }
  }

  private loadStripeScript(): Promise<void> {
    const stripeWindow = window as StripeWindow;

    if (stripeWindow.Stripe) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  private getClientSecret(payment: PaymentResponse | null): string | null {
    return payment?.clientSecret || payment?.ClientSecret || null;
  }
}
