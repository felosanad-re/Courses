export interface CourseFormRequest {
  name: string;
  description: string;
  image: File | null;
  imageUrl: string | null;
  courseTypeId: number;
  isPaid: boolean;
  price: number;
}
