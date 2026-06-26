import { Component, OnInit } from '@angular/core';
import { CourseResponseForInstructor } from '../../../../Core/Interfaces/Instructors/course-response-for-instructor';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagementCourseService } from '../../../../Core/Services/ManagementCourse/management-course.service';
import { CourseFormComponent } from '../../../../Shared/Forms/course-form/course-form.component';
import { CourseFormRequest } from '../../../../Core/Interfaces/Instructors/CourseFormRequest';
import { CourseCategoriesService } from '../../../../Core/Services/CourseCategory/course-Categories.service';
import { CourseCategoryToReturnDTO } from '../../../../Core/Interfaces/CourseCategories/course-Category-to-return-dto';
import { ApplicationResult } from '../../../../Core/Interfaces/application-result';

@Component({
  selector: 'app-update-course',
  standalone: true,
  imports: [CourseFormComponent],
  templateUrl: './update-course.component.html',
  styleUrl: './update-course.component.scss',
})
export class UpdateCourseComponent implements OnInit {
  isSubmitting: boolean = false;
  course!: CourseResponseForInstructor;
  courseId: number = 0;
  coursesCategory: CourseCategoryToReturnDTO[] = [];

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _managementCourseServices: ManagementCourseService,
    private readonly _courseCategoriesServices: CourseCategoriesService,
    private readonly _router: Router,
  ) {}

  ngOnInit(): void {
    this.getCourseCategories();

    this._route.params.subscribe((params) => {
      this.courseId = +params['courseId'];
    });

    if (this.courseId) {
      this._managementCourseServices.getCourseDetails(this.courseId).subscribe({
        next: (res) => {
          if (res.succeed && res.data) {
            this.course = res.data;
          }
        },
      });
    }
  }

  getCourseCategories(): void {
    this._courseCategoriesServices
      .getAllCourseCategories()
      .subscribe(
        (res: ApplicationResult<CourseCategoryToReturnDTO[]>) =>
          (this.coursesCategory = res.data),
      );
  }

  onFormSubmit(data: CourseFormRequest) {
    this._managementCourseServices.updateCourse(data, this.courseId).subscribe({
      next: (res) => {
        if (res.succeed && res.data) {
          this._router.navigate([
            '/instructor/course-sections-details',
            this.courseId,
          ]);
        }
      },
    });
  }
}
