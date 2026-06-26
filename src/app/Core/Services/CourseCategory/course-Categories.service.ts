import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { CourseCategoryToReturnDTO } from '../../Interfaces/CourseCategories/course-Category-to-return-dto';

@Injectable({
  providedIn: 'root',
})
export class CourseCategoriesService {
  constructor(private readonly _http: HttpClient) {}

  getAllCourseCategories(): Observable<
    ApplicationResult<CourseCategoryToReturnDTO[]>
  > {
    return this._http.get<ApplicationResult<CourseCategoryToReturnDTO[]>>(
      `${environment.apiUrl}/CourseCategories/Categories`,
    );
  }
}
