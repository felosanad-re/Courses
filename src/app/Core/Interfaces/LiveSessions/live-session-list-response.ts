export interface LiveSessionListResponse {
  courseId: number;
  courseName: string;
  zoomMeetingId: string;
  hostJoinUrl: string; // Instructor Only
  studentJoinUrl: string; // For Students
  scheduledAt: Date;
  durationMinutes: number; // Session Time
  status: string;
  recordingUrl?: string | null;
}
