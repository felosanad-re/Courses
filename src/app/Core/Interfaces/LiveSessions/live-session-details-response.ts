export interface LiveSessionDetailsResponse {
  id: number;
  sectionId: number;
  sectionName: string;
  topic: string;
  zoomMeetingId: string;
  hostJoinUrl: string;
  studentJoinUrl: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  recordingUrl?: string | null;
}
