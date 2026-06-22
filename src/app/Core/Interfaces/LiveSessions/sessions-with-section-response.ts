export interface SessionsWithSectionResponse {
  id: number;
  topic: string;
  zoomMeetingId: string;
  order: number;
  scheduledAt: Date;
  durationMinutes: number; // Session Time
  status: string;
  recordingUrl?: string;
}
