export interface AdminReviewDetailsResponse {
  id: number;
  courseId: number;
  image: string;
  courseName: string;
  studentId: number;
  studentName: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}
