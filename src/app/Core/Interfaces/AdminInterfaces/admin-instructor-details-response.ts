import { AdminInstructorCoursesResponse } from './admin-instructor-courses-response';

export interface AdminInstructorDetailsResponse {
  i: number;
  name: string;
  createdAt: Date;
  numberOfCourses: number;
  age: number;
  userId: string;
  status: string;
  isDeleted: boolean;
  address: string;
  userName: string;
  email: string;
  phoneNumber: number;
  courses: AdminInstructorCoursesResponse[];
}
