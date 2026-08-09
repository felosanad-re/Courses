export interface AdminInstructorResponse {
  id: number;
  name: string;
  createdAt: Date;
  numberOfCourses: number;
  age: number;
  specialization: string;
  approvedAt?: Date;
  userId: string;
}
