export interface EnrollmentWithCoursesResponse {
  id: number; // EnrollmentId
  isPaid: boolean;
  instructorId: number;
  courseId: number;
  price: number;
  courseCategory: string;
  type: string;
  name: string;
  description: string;
  image: string;
  averageRating: number;
  ratingCount: number;
}
