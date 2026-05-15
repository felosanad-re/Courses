import { LectureWithSectionResponse } from '../Lectures/lecture-with-section-response';

export interface SectionWithCourseResponse {
  id: number;
  title: string;
  order: number;

  courseId: number;
  lectures: LectureWithSectionResponse[];
}
