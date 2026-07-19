import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [],
  templateUrl: './loading-skeleton.component.html',
  styleUrl: './loading-skeleton.component.scss',
})
export class LoadingSkeletonComponent {
  @Input({ required: true }) count: number = 4;

  /**
   * Shape of the placeholder to render:
   *  - "course" (default): a course-card style skeleton (image + body + footer)
   *    that ships its own responsive grid. Use on student pages.
   *  - "stat": a dashboard stat-card style skeleton (icon + text lines). The
   *    host element itself becomes a 4-column grid spanning ALL columns of the
   *    parent grid (via grid-column: 1 / -1), so the placeholders never stack
   *    regardless of the parent page's layout.
   */
  @Input() type: 'course' | 'stat' = 'course';

  /** Marks the host so :host(.skeleton--stat) can turn it into a grid. */
  @HostBinding('class.skeleton--stat') get isStat(): boolean {
    return this.type === 'stat';
  }

  get skeletons() {
    return Array(this.count);
  }
}
