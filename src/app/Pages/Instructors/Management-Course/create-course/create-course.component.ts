import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApplicationResult } from '../../../../Core/Interfaces/application-result';
import { CourseResponseForInstructor } from '../../../../Core/Interfaces/Instructors/course-response-for-instructor';
import { ManagementCourseService } from '../../../../Core/Services/ManagementCourse/management-course.service';
import { CourseCategoriesService } from '../../../../Core/Services/CourseCategory/course-Categories.service';
import { CourseCategoryToReturnDTO } from '../../../../Core/Interfaces/CourseCategories/course-Category-to-return-dto';
import { CourseFormComponent } from '../../../../Shared/Forms/course-form/course-form.component';
import { CourseFormRequest } from '../../../../Core/Interfaces/Instructors/CourseFormRequest';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, CourseFormComponent],
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.scss',
})
export class CreateCourseComponent implements OnInit {
  coursesCategory: CourseCategoryToReturnDTO[] = [];
  isSubmitting = false;

  constructor(
    private readonly _managementCourseServices: ManagementCourseService,
    private readonly _courseCategoryServices: CourseCategoriesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getCourseCategories();
  }

  getCourseCategories(): void {
    this._courseCategoryServices
      .getAllCourseCategories()
      .subscribe(
        (res: ApplicationResult<CourseCategoryToReturnDTO[]>) =>
          (this.coursesCategory = res.data),
      );
  }

  onFormSubmit(data: CourseFormRequest): void {
    this.isSubmitting = true;

    const courseData: CourseFormRequest = {
      name: data.name,
      description: data.description,
      image: data.image!,
      imageUrl: data.imageUrl,
      type: data.type,
      courseCategoryId: data.courseCategoryId,
      isPaid: data.isPaid,
      price: data.price,
    };

    this._managementCourseServices
      .addCourse(courseData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response: ApplicationResult<CourseResponseForInstructor>) => {
          if (response.succeed && response.data) {
            const courseId = response.data.id;
            this.router.navigate(['/instructor/create-section', courseId]);
          }
          this.isSubmitting = false;
        },
      });
  }
}
