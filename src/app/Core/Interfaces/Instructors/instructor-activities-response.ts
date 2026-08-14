import { InstructorActivityType } from './instructor-activity-type';

export interface InstructorActivitiesResponse {
  type: InstructorActivityType;
  createdAt: Date;
  studentName: string;
  courseTitle: string;
  amount: number;
  rating: number;
}
