export interface InstructorWithCoursesResponse {
  id: number;
  name: string;
  description: string;
  image: string;
  isPaid: boolean;
  price: number;
  courseCategoryId: number;
  type: string;
  totalEnrollment: number;
  totalRevenues: number;
  firstEnrollment: Date | null;
  lastEnrollment: Date | null;
}
