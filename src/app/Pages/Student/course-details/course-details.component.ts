import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CourseDetailsToReturnDTO } from '../../../Core/Interfaces/Courses/course-details-to-return-dto';
import { CoursesService } from '../../../Core/Services/Courses/courses.service';
import { NotificationsService } from '../../../Core/Services/notifications.service';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss'],
})
export class CourseDetailsComponent implements OnInit {
  courseId!: number;
  courseDetails!: CourseDetailsToReturnDTO;
  isLoading = false;
  error: string | null = null;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _courseService: CoursesService,
    private readonly _notifications: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this._route.snapshot.paramMap.get('courseId'));
    this.getCourseDetails();
  }

  getCourseDetails(): void {
    this.isLoading = true;
    this.error = null;

    this._courseService.getCourseDetails(this.courseId).subscribe({
      next: (res: ApplicationResult<CourseDetailsToReturnDTO>) => {
        if (res.succeed && res.data) {
          this.courseDetails = res.data;
          console.log(this.courseDetails);
          this._notifications.showSuccess(
            res.message || 'Course details loaded successfully',
            'Course Details',
          );
        } else {
          this.error = res.message || 'Failed to load course details';
        }
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  enrollInCourse(): void {
    this._notifications.showSuccess(
      'Enrollment process started for: ' + this.courseDetails.name,
      'Enrollment',
    );
  }

  getTotalLectures(): number {
    return this.courseDetails.sections.reduce(
      (total, section) => total + section.lectures.length,
      0,
    );
  }
}
