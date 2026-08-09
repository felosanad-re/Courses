export interface AdminInstructorCoursesResponse {
  id: number;
  name: string;
  isPaid: boolean;
  price: number;
  courseCategoryName: string;
  courseCategoryId: number;
  type: string;
  status: string;
  publishedAt: Date;
  averageRating: number;
  ratingCount: number;
  numberOfSections: number;
}
