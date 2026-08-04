import { CourseStatus } from '../Courses/course-status';

export interface AdminCoursesResponse {
  id: number;
  name: string;
  image: string;
  isPaid: boolean;
  price: number;
  type: string;
  status: CourseStatus;
  enrollmentsCount: number;
  instructorId: number;
  instructorName: string;
  courseCategory: string;
  courseCategoryId: number;
}
