export interface InstructorWithCoursesResponse {
  id: number;
  name: string;
  description: string;
  image: string;
  isPaid: boolean;
  price: number;
  courseTypeId: number;
  totalEnrollment: number;
  totalRevenues: number;
  firstEnrollment: Date | null;
  lastEnrollment: Date | null;
}
