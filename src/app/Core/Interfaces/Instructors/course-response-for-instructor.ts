export interface CourseResponseForInstructor {
  id: number;
  name: string;
  description: string;
  image: string;
  type: string;
  isPaid: boolean;
  price: number;
  instructorId: number;
  courseCategoryId: number;
}
