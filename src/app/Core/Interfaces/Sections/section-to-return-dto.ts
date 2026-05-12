import { LectureToReturnDTO } from '../Lectures/lecture-to-return-dto';

export interface SectionToReturnDTO {
  id: number;
  title: string;
  courseName: string;
  courseId: number;
  lectures: LectureToReturnDTO[];
}
