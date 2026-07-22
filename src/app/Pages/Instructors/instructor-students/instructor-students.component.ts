import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InstructorsService } from '../../../Core/Services/Instructors/instructors.service';
import { StudentWithInstructorResponse } from '../../../Core/Interfaces/Instructors/student-with-instructor-response';
import { StudentParams } from '../../../Core/Interfaces/Instructors/student-params';
import { finalize } from 'rxjs';
import {
  TableModule,
  TableRowCollapseEvent,
  TableRowExpandEvent,
  TableLazyLoadEvent,
} from 'primeng/table';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { RippleModule } from 'primeng/ripple';
import { InstructorDashboardStatsService } from '../../../Core/Services/DashboardStats/instructor-dashboard-stats.service';
import { InstructorStats } from '../../../Core/Interfaces/DashboardStats/instructor-stats';

@Component({
  selector: 'app-instructor-students',
  standalone: true,
  imports: [
    TableModule,
    Button,
    CommonModule,
    FormsModule,
    TagModule,
    PaginatorModule,
    RippleModule,
  ],
  templateUrl: './instructor-students.component.html',
  styleUrl: './instructor-students.component.scss',
})
export class InstructorStudentsComponent implements OnInit {
  students: StudentWithInstructorResponse[] = [];
  studentParams = new StudentParams();
  isLoading: boolean = false;
  totalCount: number = 0;
  first: number = 0;

  stats: InstructorStats = {
    totalCourses: 0,
    totalNewCoursesInMonth: 0,
    totalStudents: 0,
    totalRevenues: 0,
    newTotalStudentsInMonth: 0,
    newTotalRevenuesInMonth: 0,
    averageRating: 0,
    newAverageRatingInMonth: 0,
  };

  expandedRows: Record<number, boolean> = {};

  constructor(
    private readonly _router: Router,
    private readonly _instructorService: InstructorsService,
    private readonly _statsService: InstructorDashboardStatsService,
  ) {}

  ngOnInit(): void {
    this.getAllStudents();
    this.loadStats();
  }

  loadStats() {
    this._statsService.getStats().subscribe({
      next: (res) => {
        if (res.succeed && res.data) {
          this.stats = res.data;
        }
      },
    });
  }

  getAllStudents() {
    this.isLoading = true;

    this._instructorService
      .getAllStudents(this.studentParams)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          if (res.succeed && res.data) {
            this.students = res.data.data;
            this.totalCount = res.data.count;
          }
        },
      });
  }

  /**
   * Maps PrimeNG lazy load sort field + order to backend sort param values:
   * - "name" + descending (-1) → "namedesc"
   * - "firstEnrollment" + ascending (1) → "firstenrollment"
   * - "firstEnrollment" + descending (-1) → "firstenrollmentdesc"
   */
  private mapSortToBackend(
    sortField: string | string[] | null | undefined,
    sortOrder: number | null | undefined,
  ): string | undefined {
    if (!sortField || !sortOrder) return undefined;

    const field = (
      typeof sortField === 'string' ? sortField : sortField[0]
    ).toLowerCase();
    const isDesc = sortOrder === -1;

    if (field === 'name' && isDesc) return 'namedesc';
    if (field === 'firstenrollment' && !isDesc) return 'firstenrollment';
    if (field === 'firstenrollment' && isDesc) return 'firstenrollmentdesc';

    return undefined;
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const sortParam = this.mapSortToBackend(event.sortField, event.sortOrder);

    this.studentParams.sort = sortParam;
    const first = event.first ?? 0;
    const rows = event.rows ?? this.studentParams.pageSize;
    this.studentParams.pageIndex = first / rows + 1;
    this.studentParams.pageSize = rows;
    this.first = first;

    this.getAllStudents();
  }

  onSearch() {
    this.studentParams.pageIndex = 1;
    this.first = 0;
    this.getAllStudents();
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.studentParams.pageIndex = event.first / event.rows + 1;
    this.studentParams.pageSize = event.rows;
    this.getAllStudents();
  }

  expandAll() {
    this.expandedRows = this.students.reduce(
      (acc, p) => ((acc[p.id] = true), acc),
      {} as Record<number, boolean>,
    );
  }

  collapseAll() {
    this.expandedRows = {};
  }

  onRowExpand(event: TableRowExpandEvent) {}

  onRowCollapse(event: TableRowCollapseEvent) {}
}
