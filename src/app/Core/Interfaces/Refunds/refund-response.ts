export interface RefundResponse {
  paymentIntentId: number;
  clientSecret?: string;
  courseId: number;
  cancellationReason?: string;
  enrollmentId: number;
  status: string;
}
