import { CourseDetailsToReturnDTO } from '../Courses/course-details-to-return-dto';
import { EnrollmentStatus } from './enrollment-status';

export interface EnrollmentWithCourseResponse {
  Status: EnrollmentStatus;
  EnrollmentId: number;
  Course: CourseDetailsToReturnDTO;
  CourseId: number;
  UserId: string;
  CheckOutURL: string;
}
