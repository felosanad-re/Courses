import { CourseDetailsToReturnDTO } from '../Courses/course-details-to-return-dto';
import { EnrollmentStatus } from './enrollment-status';

export interface EnrollmentWithCourseResponse {
  status: EnrollmentStatus;
  enrollmentId: number;
  course: CourseDetailsToReturnDTO;
  courseId: number;
  userId: string;
  paymentIntentId: string;
  clientSecret: string;
}
