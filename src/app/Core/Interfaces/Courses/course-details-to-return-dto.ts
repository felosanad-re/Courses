import { SectionToReturnDTO } from '../Sections/section-to-return-dto';

export interface CourseDetailsToReturnDTO {
  id: string;
  name: string;
  description: string;
  image: string;
  isPaid: boolean;
  status: string;
  price: number;
  courseType: string;
  courseTypeId: number;
  instructorName: string;
  instructorId: number;
  sections: SectionToReturnDTO[];
}
