import { CourseContentItemDTO } from '../../../Core/Interfaces/Lectures/CourseContentItemDTO';

export interface SectionToReturnDTO {
  id: number;
  title: string;
  courseName: string;
  courseId: number;
  content: CourseContentItemDTO[];
}
