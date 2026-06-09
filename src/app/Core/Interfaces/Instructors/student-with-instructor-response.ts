import { StudentCourseWithInstructor } from './student-course-with-instructor';

export interface StudentWithInstructorResponse {
  id: number;
  name: string;
  firstEnrollment: Date;
  courseCount: number;
  courses: StudentCourseWithInstructor[];
}
