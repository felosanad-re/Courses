import { Component, OnInit } from '@angular/core';
import { CourseResponseForInstructor } from '../../../../Core/Interfaces/Instructors/course-response-for-instructor';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagementCourseService } from '../../../../Core/Services/ManagementCourse/management-course.service';
import { CourseFormComponent } from '../../../../Shared/Forms/course-form/course-form.component';
import { CourseFormRequest } from '../../../../Core/Interfaces/Instructors/CourseFormRequest';
import { CourseTypeService } from '../../../../Core/Services/CourseType/course-type.service';
import { CourseTypeToReturnDTO } from '../../../../Core/Interfaces/courseTypes/course-type-to-return-dto';
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
  coursesTypes: CourseTypeToReturnDTO[] = [];

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _managementCourseServices: ManagementCourseService,
    private readonly _courseTypeServices: CourseTypeService,
    private readonly _router: Router,
  ) {}

  ngOnInit(): void {
    this.getCourseTypes();

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

  getCourseTypes(): void {
    this._courseTypeServices
      .getAllCourseTypes()
      .subscribe(
        (res: ApplicationResult<CourseTypeToReturnDTO[]>) =>
          (this.coursesTypes = res.data),
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
