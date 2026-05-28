import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationResult } from '../../Interfaces/application-result';
import { environment } from '../../../../environments/environment';
import { CreateSectionRequest } from '../../Interfaces/Sections/create-section-request';
import { UpdateSectionRequest } from '../../Interfaces/Sections/update-section-request';
import { DeleteSectionResponse } from '../../Interfaces/Sections/delete-section-response';
import { SectionWithCourseResponse } from '../../Interfaces/Courses/section-with-course-response';

@Injectable({
  providedIn: 'root',
})
export class ManagementSectionService {
  constructor(private readonly _http: HttpClient) {}

  // Create Section
  createSection(
    data: CreateSectionRequest,
  ): Observable<ApplicationResult<SectionWithCourseResponse>> {
    return this._http.post<ApplicationResult<SectionWithCourseResponse>>(
      `${environment.apiUrl}/ManagementSection/Create`,
      data,
    );
  }

  // Update Section
  updateSection(
    data: UpdateSectionRequest,
  ): Observable<ApplicationResult<SectionWithCourseResponse>> {
    return this._http.put<ApplicationResult<SectionWithCourseResponse>>(
      `${environment.apiUrl}/ManagementSection/Update`,
      data,
    );
  }

  // Delete Section
  deleteSection(
    sectionId: number,
  ): Observable<ApplicationResult<DeleteSectionResponse>> {
    return this._http.delete<ApplicationResult<DeleteSectionResponse>>(
      `${environment.apiUrl}/ManagementSection/${sectionId}`,
    );
  }

  // Delete Sections
  deleteSections(
    sectionIds: number[],
  ): Observable<ApplicationResult<DeleteSectionResponse>> {
    return this._http.post<ApplicationResult<DeleteSectionResponse>>(
      `${environment.apiUrl}/ManagementSection/multi-delete`,
      sectionIds,
    );
  }
}
