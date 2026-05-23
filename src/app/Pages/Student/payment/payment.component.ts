import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseDetailsToReturnDTO } from '../../../Core/Interfaces/Courses/course-details-to-return-dto';
import { PaymentResponse } from '../../../Core/Interfaces/Payments/payment-response';
import { StripeElements } from '../../../Core/Interfaces/Stripe/stripe-elements';
import { StripePaymentElement } from '../../../Core/Interfaces/Stripe/stripe-payment-element';
import { CoursesService } from '../../../Core/Services/Courses/courses.service';
import { PaymentService } from '../../../Core/Services/Payments/payment.service';
import { StripeService } from '../../../Core/Services/Stripe/stripe.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('paymentElement') paymentElementRef?: ElementRef<HTMLElement>;
  isLoading = false;
  isSubmitting = false;

  // Stripe Properties
  enrollmentId!: number;
  clientSecret: string | null = null;
  paymentReady = false;
  paymentError: string | null = null;
  courseDetails: CourseDetailsToReturnDTO | null = null;

  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _paymentService: PaymentService,
    private readonly _courseService: CoursesService,
    private readonly _stripeService: StripeService,
    private readonly _notifications: NotificationsService,
    private readonly _router: Router,
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
    this._stripeService.unmountElement(this.paymentElement);
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

          if (res.data?.courseId) {
            this.getCourseDetails(res.data.courseId);
          }

          this.clientSecret = clientSecret;
          void this.mountStripeElement(clientSecret); // Create Stripe Elements
        },
      });
  }

  async confirmPayment(): Promise<void> {
    debugger;
    if (!this.elements || !this.paymentReady || !this.clientSecret) {
      this.paymentError = 'Please complete your payment details first.';
      return;
    }

    this.isSubmitting = true;
    this.paymentError = null;

    try {
      const result = await this._stripeService.confirmPayment(
        this.elements,
        `${window.location.origin}/student/my-courses`,
      );

      if (result.error) {
        this.isSubmitting = false;
        this.paymentError = result.error.message || 'Payment failed.';
        this._notifications.showError(this.paymentError, 'Payment');
        return;
      }

      this.verifyWithBackend(this.extractPaymentIntentId(this.clientSecret));
    } catch {
      this.isSubmitting = false;
      this.paymentError = 'Unable to confirm payment. Please try again.';
      this._notifications.showError(this.paymentError, 'Payment');
    }
  }

  goBack(): void {
    this._router.navigate(['/student', 'home']);
  }

  getCourseName(): string {
    return this.courseDetails?.name || 'Selected course';
  }

  getCourseType(): string {
    return this.courseDetails?.courseType || 'Paid course';
  }

  getFormattedAmount(): string {
    const amount = this.courseDetails?.price;

    if (amount === undefined || amount === null) {
      return 'To be confirmed';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  getCourseDetails(courseId: number): void {
    this._courseService.getCourseDetails(courseId).subscribe({
      next: (res: ApplicationResult<CourseDetailsToReturnDTO>) => {
        if (res.succeed && res.data) {
          this.courseDetails = res.data;
        }
      },
    });
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
    });
  }

  private async mountStripeElement(clientSecret: string): Promise<void> {
    if (!this.paymentElementRef) {
      this.paymentError = 'Payment form is not ready. Please try again.';
      this._notifications.showError(this.paymentError, 'Payment');
      this.isLoading = false;
      return;
    }

    try {
      this.elements = await this._stripeService.createElements(clientSecret, {
        theme: 'stripe',
        variables: {
          borderRadius: '8px',
          colorPrimary: '#2563eb',
        },
      });

      this.paymentElement = this._stripeService.createPaymentElement(
        this.elements,
        this.paymentElementRef.nativeElement,
        (event) => {
          this.paymentReady = event.complete;
          this.paymentError = event.error?.message || null;
        },
      );
    } catch {
      this.paymentError = 'Unable to load Stripe. Please try again.';
      this._notifications.showError(this.paymentError, 'Payment');
    } finally {
      this.isLoading = false;
    }
  }

  private extractPaymentIntentId(clientSecret: string): string {
    return clientSecret.split('_secret_')[0];
  }

  private getClientSecret(payment: PaymentResponse | null): string | null {
    return payment?.clientSecret || null;
  }
}
