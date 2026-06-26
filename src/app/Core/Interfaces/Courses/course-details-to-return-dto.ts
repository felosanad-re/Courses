import { SectionToReturnDTO } from '../Sections/section-to-return-dto';

export interface CourseDetailsToReturnDTO {
  id: string;
  name: string;
  description: string;
  image: string;
  isPaid: boolean;
  type: string;
  status: string;
  price: number;
  courseCategory: string;
  courseCategoryId: number;
  instructorName: string;
  instructorId: number;
  sections: SectionToReturnDTO[];
}
