import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseWithLectureVideoResponse } from '../../../Core/Interfaces/Courses/course-with-lecture-video-response';
import { SectionWithCourseResponse } from '../../../Core/Interfaces/Courses/section-with-course-response';
import { LectureWithSectionResponse } from '../../../Core/Interfaces/Lectures/lecture-with-section-response';
import { StudentService } from '../../../Core/Services/Student/student.service';

type LectureVideoResponse = CourseWithLectureVideoResponse & {
  id?: number;
  title?: string;
  videoUrl?: string;
  videoURL?: string;
  url?: string;
  order?: number;
};

@Component({
  selector: 'app-view-lecture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-lecture.component.html',
  styleUrl: './view-lecture.component.scss',
})
export class ViewLectureComponent implements OnInit {
  courseId!: number;
  sections: SectionWithCourseResponse[] = [];
  activeSectionId: number | null = null;
  activeLectureId: number | null = null;
  activeVideo: LectureVideoResponse | null = null;
  activeVideoTitle = 'Choose a lecture';
  originalVideoUrl: string | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  directVideoUrl: string | null = null;
  isYoutubeVideo = false;
  isSectionsLoading = false;
  isVideoLoading = false;
  sectionsError: string | null = null;
  videoError: string | null = null;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _studentService: StudentService,
    private readonly _sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.courseId = Number(
      this._route.snapshot.paramMap.get('courseId') ||
        this._route.snapshot.queryParamMap.get('courseId'),
    );

    if (!this.courseId) {
      this.sectionsError = 'Course id is missing.';
      return;
    }

    this.getSections();
  }

  getSections(): void {
    this.isSectionsLoading = true;
    this.sectionsError = null;

    this._studentService.getSections(this.courseId).subscribe({
      next: (res: ApplicationResult<SectionWithCourseResponse[]>) => {
        if (res.succeed && res.data) {
          const data = res.data as
            | SectionWithCourseResponse
            | SectionWithCourseResponse[];

          this.sections = (Array.isArray(data) ? data : [data]).sort(
            (first, second) => first.order - second.order,
          );

          const firstSection = this.sections[0];
          this.activeSectionId = firstSection?.id ?? null;

          if (firstSection?.lectures?.length) {
            this.playLecture(firstSection.lectures[0]);
          }

          return;
        }

        this.sections = [];
        this.sectionsError =
          res.message || 'No sections found for this course.';
      },
      complete: () => {
        this.isSectionsLoading = false;
      },
    });
  }

  toggleSection(sectionId: number): void {
    this.activeSectionId =
      this.activeSectionId === sectionId ? null : sectionId;
  }

  playLecture(lecture: LectureWithSectionResponse): void {
    this.activeLectureId = lecture.id;
    this.isVideoLoading = true;
    this.videoError = null;
    this.safeVideoUrl = null;
    this.directVideoUrl = null;
    this.isYoutubeVideo = false;

    this._studentService.getVideoInLecture(lecture.id).subscribe({
      next: (res: ApplicationResult<CourseWithLectureVideoResponse>) => {
        if (res.succeed && res.data) {
          this.activeVideo = res.data;
          this.activeVideoTitle = this.getVideoTitle(res.data);

          const videoUrl = this.getVideoUrl(res.data);
          if (videoUrl) {
            this.setVideoSource(videoUrl);
          } else {
            this.videoError = 'Video URL is missing for this lecture.';
          }

          return;
        }

        this.activeVideo = null;
        this.activeVideoTitle = 'Choose a lecture';
        this.safeVideoUrl = null;
        this.directVideoUrl = null;
        this.originalVideoUrl = null;
        this.videoError = res.message || 'Unable to load this lecture video.';
      },
      error: () => {
        this.activeVideo = null;
        this.activeVideoTitle = 'Choose a lecture';
        this.safeVideoUrl = null;
        this.directVideoUrl = null;
        this.originalVideoUrl = null;
        this.videoError = 'Something went wrong while loading the video.';
      },
      complete: () => {
        this.isVideoLoading = false;
      },
    });
  }

  private setVideoSource(videoUrl: string): void {
    const normalizedVideoUrl = this.normalizeVideoUrl(videoUrl);
    this.originalVideoUrl = normalizedVideoUrl;

    const youtubeEmbedUrl = this.getYoutubeEmbedUrl(normalizedVideoUrl);

    if (youtubeEmbedUrl) {
      this.isYoutubeVideo = true;
      this.safeVideoUrl =
        this._sanitizer.bypassSecurityTrustResourceUrl(youtubeEmbedUrl);
      return;
    }

    this.isYoutubeVideo = false;
    this.directVideoUrl = normalizedVideoUrl;
  }

  private getVideoUrl(video: LectureVideoResponse): string {
    return (video.videoUrl || video.videoURL || video.url || '').trim();
  }

  private getVideoTitle(video: LectureVideoResponse): string {
    return video.title || 'Lecture video';
  }

  private normalizeVideoUrl(videoUrl: string): string {
    const trimmedUrl = videoUrl.trim();

    if (/^https?:\/\//i.test(trimmedUrl)) {
      return trimmedUrl;
    }

    return `https://${trimmedUrl}`;
  }

  private getYoutubeEmbedUrl(videoUrl: string): string | null {
    try {
      const url = new URL(videoUrl);
      const host = url.hostname.replace('www.', '');
      let videoId = '';

      if (host === 'youtube.com' || host === 'm.youtube.com') {
        videoId = url.searchParams.get('v') || '';

        if (!videoId && url.pathname.startsWith('/shorts/')) {
          videoId = url.pathname.split('/')[2] || '';
        }

        if (!videoId && url.pathname.startsWith('/embed/')) {
          videoId = url.pathname.split('/')[2] || '';
        }
      }

      if (host === 'youtu.be') {
        videoId = url.pathname.replace('/', '');
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  }

  trackBySectionId(index: number, section: SectionWithCourseResponse): number {
    return section.id;
  }

  trackByLectureId(index: number, lecture: LectureWithSectionResponse): number {
    return lecture.id;
  }
}
