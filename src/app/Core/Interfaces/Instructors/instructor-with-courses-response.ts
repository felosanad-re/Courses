export interface InstructorWithCoursesResponse {
  id: number;
  name: string;
  description: string;
  image: string;
  isPaid: boolean;
  price: number;
  courseTypeId: number;
  status: string;
  totalEnrollment: number;
  totalRevenues: number;
  firstEnrollment: Date | null;
  lastEnrollment: Date | null;
}
