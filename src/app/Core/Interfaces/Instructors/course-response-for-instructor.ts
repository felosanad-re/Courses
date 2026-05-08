export interface CourseResponseForInstructor {
  id: number;
  name: string;
  description: string;
  image: string;
  isPaid: boolean;
  price: number;
  instructorId: number;
  createdAt?: string;
  updatedAt?: string;
}