import { AccountStatus } from '../Auth/account-status';
import { AdminEnrollmentsWithStudentResponse } from './admin-enrollments-with-student-response';

export interface AdminWithStudentDetailsResponse {
  id: number;
  name: string;
  createdAt: Date;
  numberOfEnrollments: number;
  age: number;

  userId: string;
  status: string;
  isDeleted: boolean;
  address: string;
  userName: string;
  email: string;
  phone?: string;
  enrollments: AdminEnrollmentsWithStudentResponse[];
}
