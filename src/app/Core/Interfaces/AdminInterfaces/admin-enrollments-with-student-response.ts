export interface AdminEnrollmentsWithStudentResponse {
  id: number; // Enrollment
  studentId: number;
  studentName: string;

  // The course the student enrolled in (many-to-one)
  courseId: number;
  courseName: string;

  // For Paid Courses
  isPaid: boolean;
  amount: number;

  status: string;
}
