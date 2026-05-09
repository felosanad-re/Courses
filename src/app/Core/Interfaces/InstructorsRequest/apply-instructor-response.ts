import { InstructorRequestStatus } from './instructor-request-status';

export interface ApplyInstructorResponse {
  id: number;
  userId: string;
  userName: string;
  email: string;
  bio: string;
  specialty: string;
  experienceYears: number;
  status: InstructorRequestStatus;
  rejectionReason?: string;
  createdAt: Date;
}
