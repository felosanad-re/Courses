import { SessionsWithSectionResponse } from './sessions-with-section-response';

export interface SectionWithSessionsResponse {
  id: number; // SectionId
  courseId: number;
  title: string;
  order: number;
  sessions: SessionsWithSectionResponse[];
}
