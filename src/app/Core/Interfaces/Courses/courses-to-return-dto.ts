export interface CoursesToReturnDTO {
  id: number;
  name: string;
  description: string;
  image: string;
  type: string;
  status: string;
  isPaid: boolean;
  price: number;
  courseCategory: string;
  courseCategoryId: number;
  averageRating: number;
  ratingCount: number;
}
