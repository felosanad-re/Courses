export interface LiveSessionRequest {
  topic: string;
  scheduledAt: Date | string;
  duration: number;
  sectionId: number;
}
