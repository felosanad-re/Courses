export interface LiveSessionResponse {
  courseId: number;
  courseName: string;
  zoomMeetingId: string;
  hostJoinUrl: string;
  studentJoinUrl: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  status: string;
  recordingUrl?: string | null;
}
