export interface AdminReviewsResponse {
  id: number; // Review
  courseId: number;
  courseName: string;
  image: string;
  studentId: number;
  studentName: string;
  averageRating: number;
  ratingCount: number;
}
