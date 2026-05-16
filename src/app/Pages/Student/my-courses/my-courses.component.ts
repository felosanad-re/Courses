import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseProgressResponse } from '../../../Core/Interfaces/Progresses/course-progress-response';
import { CoursesToReturnDTO } from '../../../Core/Interfaces/Courses/courses-to-return-dto';
import { StudentService } from '../../../Core/Services/Student/student.service';
import { ProgressService } from '../../../Core/Services/Progress/progress.service';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss',
})
export class MyCoursesComponent implements OnInit {
  courses: CoursesToReturnDTO[] = [];
  filteredCourses: CoursesToReturnDTO[] = [];
  courseProgressMap = new Map<number, CourseProgressResponse>();
  isLoading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private readonly _studentService: StudentService,
    private readonly _progressService: ProgressService,
    private readonly _router: Router,
  ) {}

  ngOnInit(): void {
    this.getAllCourses();
  }

  // Get All Courses
  getAllCourses(): void {
    this.isLoading = true;
    this.error = null;

    this._studentService.getStudentCourses().subscribe({
      next: (res: ApplicationResult<CoursesToReturnDTO[]>) => {
        if (res.succeed && res.data) {
          this.courses = res.data;
          this.filteredCourses = res.data;
          this.loadCoursesProgress();
          return;
        }

        this.courses = [];
        this.filteredCourses = [];
        this.error = res.message || 'Unable to load your enrolled courses.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.trim().toLowerCase();

    if (!this.searchTerm) {
      this.filteredCourses = this.courses;
      return;
    }

    this.filteredCourses = this.courses.filter((course) => {
      const searchableText = `${course.name} ${course.description} ${course.courseType}`;
      return searchableText.toLowerCase().includes(this.searchTerm);
    });
  }

  viewCourse(courseId: number): void {
    this._router.navigate(['/student', 'view-lecture', courseId]);
  }

  getCourseProgressPercentage(courseId: number): number {
    return this.courseProgressMap.get(courseId)?.ProgressPercentage ?? 0;
  }

  getCourseProgressLabel(courseId: number): string {
    const progress = this.courseProgressMap.get(courseId);
    if (!progress) return 'Ready to learn';
    if (progress.ProgressPercentage === 100) return 'Completed!';
    if (progress.ProgressPercentage > 0) return 'In progress';
    return 'Ready to learn';
  }

  private loadCoursesProgress(): void {
    this.courses.forEach((course) => {
      this._progressService.getCourseProgress(course.id).subscribe({
        next: (res: ApplicationResult<CourseProgressResponse>) => {
          if (res.succeed && res.data) {
            this.courseProgressMap.set(course.id, res.data);
          }
        },
      });
    });
  }

  trackByCourseId(index: number, course: CoursesToReturnDTO): number {
    return course.id;
  }
}
