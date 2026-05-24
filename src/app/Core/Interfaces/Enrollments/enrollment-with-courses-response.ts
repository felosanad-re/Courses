export interface EnrollmentWithCoursesResponse {
  id: number; // EnrollmentId
  isPaid: boolean;
  instructorId: number;
  courseId: number;
  price: number;
  courseType: string;
  name: string;
  description: string;
  image: string;
}
