export interface AdminWithStudentResponse {
  id: number;
  name: string;
  createdAt: Date;
  numberOfEnrollments: number;
  age: number;
  userId: string;
  isInstructor: boolean;
}
