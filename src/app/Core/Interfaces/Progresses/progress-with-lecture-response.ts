export interface ProgressWithLectureResponse {
  enrollmentId: number;
  lectureId: number;
  lectureName: string;
  lastWatchedSeconds: number;
  videoDuration: number;
  isCompleted: boolean;
  completedAt: Date;
  lastAccessedAt: Date;
}
