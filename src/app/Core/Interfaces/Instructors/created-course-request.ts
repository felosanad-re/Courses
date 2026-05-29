export interface CreatedCourseRequest {
  name: string;
  description: string;
  image: File;
  courseTypeId: number;
  isPaid: boolean;
  price: number;
}
