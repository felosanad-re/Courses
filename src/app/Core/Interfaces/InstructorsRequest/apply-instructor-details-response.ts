export interface ApplyInstructorDetailsResponse {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  bio: string;
  specialty: string;
  experienceYears: number;
  status: string;
  rejectionReason: string;
  createdAt: Date;
}
