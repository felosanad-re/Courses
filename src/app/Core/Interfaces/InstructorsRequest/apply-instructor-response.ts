import { InstructorRequestStatus } from './instructor-request-status';

export interface ApplyInstructorResponse {
  id: number;
  userId: string;
  fullName: string;
  specialty: string;
  experienceYears: number;
  createdAt: Date;
}
