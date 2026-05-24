export interface RefundRequest {
  enrollmentId: number;
  cancellationReason?: string | null;
}
