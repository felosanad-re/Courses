import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApplicationResult } from '../../../../Core/Interfaces/application-result';
import { CourseResponseForInstructor } from '../../../../Core/Interfaces/Instructors/course-response-for-instructor';
import { ManagementCourseService } from '../../../../Core/Services/ManagementCourse/management-course.service';
import { CourseTypeService } from '../../../../Core/Services/CourseType/course-type.service';
import { CourseTypeToReturnDTO } from '../../../../Core/Interfaces/courseTypes/course-type-to-return-dto';
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
  coursesTypes: CourseTypeToReturnDTO[] = [];
  isSubmitting = false;

  constructor(
    private readonly _managementCourseServices: ManagementCourseService,
    private readonly _courseTypeServices: CourseTypeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getCourseTypes();
  }

  getCourseTypes(): void {
    this._courseTypeServices
      .getAllCourseTypes()
      .subscribe(
        (res: ApplicationResult<CourseTypeToReturnDTO[]>) =>
          (this.coursesTypes = res.data),
      );
  }

  onFormSubmit(data: CourseFormRequest): void {
    this.isSubmitting = true;

    const courseData: CourseFormRequest = {
      name: data.name,
      description: data.description,
      image: data.image!,
      courseTypeId: data.courseTypeId,
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
