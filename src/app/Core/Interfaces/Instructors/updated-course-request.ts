export interface UpdatedCourseRequest {
  name: string;
  description: string;
  image: string;
  courseTypeId: number;
  isPaid: boolean;
  price: number;
}
