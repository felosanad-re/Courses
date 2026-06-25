export interface LiveSessionListResponse {
  id: number; // Session Id
  sectionId: number;
  sectionName: string;
  courseName: string;
  topic: string;
  zoomMeetingId: string;
  hostJoinUrl: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
}
