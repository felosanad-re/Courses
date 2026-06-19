import { CourseStatus } from '../Courses/course-status';

export interface CourseFormRequest {
  name: string;
  description: string;
  image: File | null;
  imageUrl: string | null;
  status: CourseStatus;
  courseTypeId: number;
  isPaid: boolean;
  price: number;
}
