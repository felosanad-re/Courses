import { CourseType } from '../Courses/course-type';

export interface CourseFormRequest {
  name: string;
  description: string;
  image: File | null;
  imageUrl: string | null;
  type: CourseType;
  courseCategoryId: number;
  isPaid: boolean;
  price: number;
}
