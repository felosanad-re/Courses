import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CoursesToReturnDTO } from '../../../Core/Interfaces/Courses/courses-to-return-dto';
import { StudentService } from '../../../Core/Services/Student/student.service';

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
  isLoading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private readonly _studentService: StudentService,
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

  trackByCourseId(index: number, course: CoursesToReturnDTO): number {
    return course.id;
  }
}
