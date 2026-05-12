import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { CourseTypeToReturnDTO } from '../../Interfaces/courseTypes/course-type-to-return-dto';

@Injectable({
  providedIn: 'root',
})
export class CourseTypeService {
  constructor(private readonly _http: HttpClient) {}

  getAllCourseTypes(): Observable<ApplicationResult<CourseTypeToReturnDTO[]>> {
    return this._http.get<ApplicationResult<CourseTypeToReturnDTO[]>>(
      `${environment.apiUrl}/courseTypes/types`,
    );
  }
}
