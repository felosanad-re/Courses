export interface CreatedCourseRequest {
  name: string;
  description: string;
  image: string;
  courseTypeId: number;
  isPaid: boolean;
  price: number;
}
