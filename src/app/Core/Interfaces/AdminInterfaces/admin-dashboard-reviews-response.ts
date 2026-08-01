export interface AdminDashboardReviewsResponse {
  id: number; // RatingId
  rating: number;
  studentName: string;
  courseName: string;
  comment?: string;
  createdAt: string;
}
