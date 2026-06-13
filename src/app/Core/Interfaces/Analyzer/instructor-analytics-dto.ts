import { CourseAnalyticDTO } from '../Courses/course-analytic-dto';

export interface InstructorAnalyticsDto {
  totalCourses: number;
  totalEnrollments: number;
  totalStudents: number;
  totalRevenue: number;
  averageCourseRating?: number;
  publishedCourses?: number;
  draftCourses?: number;
  topCourseSelling?: CourseAnalyticDTO;
  topCourseRating?: CourseAnalyticDTO;
}
