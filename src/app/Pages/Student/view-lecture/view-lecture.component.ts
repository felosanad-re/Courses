import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApplicationResult } from '../../../Core/Interfaces/application-result';
import { CourseWithLectureVideoResponse } from '../../../Core/Interfaces/Courses/course-with-lecture-video-response';
import { SectionWithCourseResponse } from '../../../Core/Interfaces/Courses/section-with-course-response';
import { LectureWithSectionResponse } from '../../../Core/Interfaces/Lectures/lecture-with-section-response';
import { ProgressWithLectureResponse } from '../../../Core/Interfaces/Progresses/progress-with-lecture-response';
import { StudentService } from '../../../Core/Services/Student/student.service';
import { ProgressService } from '../../../Core/Services/Progress/progress.service';

@Component({
  selector: 'app-view-lecture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-lecture.component.html',
  styleUrl: './view-lecture.component.scss',
})
export class ViewLectureComponent implements OnInit, OnDestroy {
  courseId!: number;
  sections: SectionWithCourseResponse[] = [];
  activeSectionId: number | null = null;
  activeLectureId: number | null = null;
  activeVideo: CourseWithLectureVideoResponse | null = null;
  activeVideoTitle = 'Choose a lecture';
  originalVideoUrl: string | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  directVideoUrl: string | null = null;
  isYoutubeVideo = false;
  isSectionsLoading = false;
  isVideoLoading = false;
  sectionsError: string | null = null;
  videoError: string | null = null;

  // Progress tracking
  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;
  lastWatchedSeconds = 0;
  progressUpdateInterval: ReturnType<typeof setInterval> | null = null;
  progressSub: Subscription | null = null;
  youtubePlayer: any = null;
  youtubePlayerReady = false;
  youtubeApiLoaded = false;
  youtubeApiLoading = false;
  private readonly YOUTUBE_PLAYER_ID = 'youtubePlayer';
  private seekRetryCount = 0;
  private readonly MAX_SEEK_RETRIES = 10;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _studentService: StudentService,
    private readonly _sanitizer: DomSanitizer,
    private readonly _progressService: ProgressService,
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
    // Save progress of current lecture before switching
    this.saveCurrentProgress();
    this.stopProgressTracking();

    this.activeLectureId = lecture.id;
    this.isVideoLoading = true;
    this.videoError = null;
    this.safeVideoUrl = null;
    this.directVideoUrl = null;
    this.isYoutubeVideo = false;
    this.lastWatchedSeconds = 0;

    // Fetch lecture progress alongside video
    this.getLectureProgress(lecture.id);

    this._studentService.getVideoInLecture(lecture.id).subscribe({
      next: (res: ApplicationResult<CourseWithLectureVideoResponse>) => {
        if (res.succeed && res.data) {
          this.activeVideo = res.data;
          this.activeVideoTitle = this.getVideoTitle(res.data);

          const videoUrl = this.getVideoUrl(res.data);
          if (videoUrl) {
            this.setVideoSource(videoUrl);
            // Apply saved progress to the now-known video type
            this.applyProgressToVideo();
            // Start periodic progress tracking after video source is set
            this.startProgressTracking();
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
      // Add enablejsapi=1 for YouTube IFrame Player API access
      const origin = window.location.origin;
      const apiUrl = `${youtubeEmbedUrl}?enablejsapi=1&origin=${encodeURIComponent(origin)}`;
      this.safeVideoUrl =
        this._sanitizer.bypassSecurityTrustResourceUrl(apiUrl);
      this.initYoutubePlayer();
      return;
    }

    this.isYoutubeVideo = false;
    this.directVideoUrl = normalizedVideoUrl;
  }

  private getVideoUrl(video: CourseWithLectureVideoResponse): string {
    return (video.videoUrl || '').trim();
  }

  private getVideoTitle(video: CourseWithLectureVideoResponse): string {
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

  // ─── Progress tracking methods ───

  private getLectureProgress(lectureId: number): void {
    this.progressSub?.unsubscribe();
    this.progressSub = this._progressService
      .getLectureProgress(lectureId)
      .subscribe({
        next: (res: ApplicationResult<ProgressWithLectureResponse>) => {
          if (res.succeed && res.data) {
            this.lastWatchedSeconds = res.data.lastWatchedSeconds;
            // If video type is already known (progress arrived after video),
            // apply progress immediately; otherwise it will be applied
            // in playLecture after setVideoSource.
            this.applyProgressToVideo();
          }
        },
      });
  }

  private applyProgressToVideo(): void {
    if (this.lastWatchedSeconds <= 0) return;

    if (this.isYoutubeVideo) {
      // Use YouTube IFrame API seekTo if player is ready
      if (this.youtubePlayerReady && this.youtubePlayer) {
        this.youtubePlayer.seekTo(this.lastWatchedSeconds, true);
      }
      // Otherwise, onReady callback will handle seeking automatically
    } else {
      this.seekVideoToLastPosition();
    }
  }

  private seekVideoToLastPosition(): void {
    if (!this.videoPlayerRef?.nativeElement) {
      if (this.seekRetryCount < this.MAX_SEEK_RETRIES) {
        this.seekRetryCount++;
        setTimeout(() => this.seekVideoToLastPosition(), 200);
      }
      return;
    }

    this.seekRetryCount = 0;
    const video = this.videoPlayerRef.nativeElement;

    if (video.readyState >= 1) {
      video.currentTime = this.lastWatchedSeconds;
    } else {
      video.addEventListener(
        'loadeddata',
        () => {
          video.currentTime = this.lastWatchedSeconds;
        },
        { once: true },
      );
    }
  }

  private loadYoutubeApi(): void {
    if (this.youtubeApiLoaded || this.youtubeApiLoading) return;
    this.youtubeApiLoading = true;

    (window as any).onYouTubeIframeAPIReady = () => {
      this.youtubeApiLoaded = true;
      this.youtubeApiLoading = false;
      if (this.isYoutubeVideo && this.safeVideoUrl) {
        this.initYoutubePlayer();
      }
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  private initYoutubePlayer(): void {
    if (!this.youtubeApiLoaded) {
      this.loadYoutubeApi();
      return;
    }

    // Destroy previous player instance
    if (this.youtubePlayer) {
      this.youtubePlayer.destroy();
      this.youtubePlayer = null;
    }
    this.youtubePlayerReady = false;

    // Wait for Angular to render the iframe before wrapping it
    setTimeout(() => {
      const iframe = document.getElementById(this.YOUTUBE_PLAYER_ID);
      if (!iframe) return;

      this.youtubePlayer = new (window as any).YT.Player(
        this.YOUTUBE_PLAYER_ID,
        {
          events: {
            onReady: () => {
              this.youtubePlayerReady = true;
              // Seek to last watched position if we have progress data
              if (this.lastWatchedSeconds > 0) {
                this.youtubePlayer.seekTo(this.lastWatchedSeconds, true);
              }
            },
            onStateChange: (event: any) => {
              // YT.PlayerState.PLAYING = 1
              // Ensure progress tracking is running when video plays
              if (event.data === 1 && !this.progressUpdateInterval) {
                this.startProgressTracking();
              }
            },
          },
        },
      );
    }, 300);
  }

  onVideoTimeUpdate(event: Event): void {
    const video = event.target as HTMLVideoElement;
    this.lastWatchedSeconds = video.currentTime;
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();
    this.progressUpdateInterval = setInterval(() => {
      const isPlaying = this.isVideoPlaying();

      if (!isPlaying) {
        // Video is paused/stopped — skip saving, don't update time
        return;
      }

      if (
        this.isYoutubeVideo &&
        this.youtubePlayer &&
        this.youtubePlayerReady
      ) {
        // Get real current time from YouTube IFrame API
        const currentTime = this.youtubePlayer.getCurrentTime();
        if (currentTime > 0) {
          this.lastWatchedSeconds = currentTime;
        }
      }

      this.saveCurrentProgress();
    }, 15000); // Save progress every 15 seconds only while playing
  }

  private isVideoPlaying(): boolean {
    if (this.isYoutubeVideo) {
      // YT.PlayerState: PLAYING=1, PAUSED=2, BUFFERING=3
      if (this.youtubePlayer && this.youtubePlayerReady) {
        const state = this.youtubePlayer.getPlayerState();
        return state === 1 || state === 3; // playing or buffering
      }
      return false; // YouTube player not ready → not playing
    }

    // Direct <video> element
    if (this.videoPlayerRef?.nativeElement) {
      return !this.videoPlayerRef.nativeElement.paused;
    }
    return false;
  }

  private stopProgressTracking(): void {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
      this.progressUpdateInterval = null;
    }
  }

  private saveCurrentProgress(): void {
    if (!this.activeLectureId || this.lastWatchedSeconds <= 0) return;

    this._progressService
      .addOrUpdateProgress({
        lectureId: this.activeLectureId,
        currentTime: this.lastWatchedSeconds,
      })
      .subscribe({
        next: (res: ApplicationResult<ProgressWithLectureResponse>) => {
          if (res.succeed) {
            console.log(
              `[Progress] Saved — lecture ${this.activeLectureId}, time ${this.lastWatchedSeconds}s`,
            );
          } else {
            console.warn('[Progress] Save failed:', res.message);
          }
        },
        error: (err) => {
          console.error('[Progress] Save error:', err);
        },
      });
  }

  ngOnDestroy(): void {
    this.saveCurrentProgress();
    this.stopProgressTracking();
    this.progressSub?.unsubscribe();
    if (this.youtubePlayer) {
      this.youtubePlayer.destroy();
      this.youtubePlayer = null;
    }
  }
}
