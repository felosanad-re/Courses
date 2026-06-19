export interface CourseResponseForInstructor {
  id: number;
  name: string;
  description: string;
  image: string;
  status: string;
  isPaid: boolean;
  price: number;
  instructorId: number;
  courseTypeId: number;
}
