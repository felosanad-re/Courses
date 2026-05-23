export interface PaymentResponse {
  paymentIntentId?: string;
  clientSecret?: string | null;
  enrollmentId?: number;
  courseId?: number;
  status?: string;
}
