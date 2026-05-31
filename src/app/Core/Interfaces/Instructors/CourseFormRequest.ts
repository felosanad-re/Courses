export interface CourseFormRequest {
  name: string;
  description: string;
  image: File | null;
  courseTypeId: number;
  isPaid: boolean;
  price: number;
}
