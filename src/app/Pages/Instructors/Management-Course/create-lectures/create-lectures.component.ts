import {
  Component,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ManagementLectureService } from '../../../../Core/Services/ManagementCourse/management-lecture.service';
import { CreatedLectureRequest } from '../../../../Core/Interfaces/Lectures/created-lecture-request';
import { ApplicationResult } from '../../../../Core/Interfaces/application-result';
import { LectureWithInstructorResponse } from '../../../../Core/Interfaces/Lectures/lecture-with-instructor-response';
import { NotificationsService } from '../../../../Core/Services/notifications.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';

declare global {
  interface Window {
    YT: any;
  }
}

@Component({
  selector: 'app-create-lectures',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    ToastModule,
    MessageModule,
    CardModule,
    RouterLink,
  ],
  templateUrl: './create-lectures.component.html',
  styleUrl: './create-lectures.component.scss',
})
export class CreateLecturesComponent implements OnInit, OnDestroy {
  sectionId!: number;
  isSubmitting = false;
  createLectureForm!: FormGroup;
  durationInSeconds: number = 0;
  isAutoDetecting = false;
  autoDetectFailed = false;
  autoDetectSuccess = false;
  formattedDuration: string = '00:00:00';
  youtubeVideoId: string | null = null;

  private ytPlayer: any = null;
  private ytPlayerReady = false;
  private apiReadyPollId: number | null = null;
  private durationPollId: number | null = null;
  private detectRequestId = 0;

  private readonly isBrowser: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly _managementLectureService: ManagementLectureService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _notifications: NotificationsService,
    private readonly _cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.sectionId = +params['sectionId'];
    });
    this.initForm();
  }

  // Stops any active YouTube duration detection when the component is destroyed.
  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.detectRequestId++;
      this.clearApiReadyPoll();
      this.destroyYouTubePlayer();
    }
  }

  initForm(): void {
    this.createLectureForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      videoUrl: ['', [Validators.required, Validators.maxLength(200)]],
      order: [1, [Validators.required, Validators.min(1)]],
      durationHours: [0, [Validators.required, Validators.min(0)]],
      durationMinutes: [
        0,
        [Validators.required, Validators.min(0), Validators.max(59)],
      ],
      durationSeconds: [
        0,
        [Validators.required, Validators.min(0), Validators.max(59)],
      ],
      isPreview: [false],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createLectureForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Runs whenever the video URL changes and starts YouTube duration detection when possible.
  onVideoUrlChange(): void {
    if (!this.isBrowser) return;

    const url = (this.createLectureForm.get('videoUrl')?.value || '').trim();
    if (!url) {
      this.detectRequestId++;
      this.autoDetectFailed = false;
      this.autoDetectSuccess = false;
      this.isAutoDetecting = false;
      this.youtubeVideoId = null;
      this.destroyYouTubePlayer();
      return;
    }

    // Get YouTube video id
    this.youtubeVideoId = this.extractYouTubeVideoId(url);

    if (this.youtubeVideoId) {
      const requestId = ++this.detectRequestId;
      this.isAutoDetecting = true;
      this.autoDetectFailed = false;
      this.autoDetectSuccess = false;
      this.loadYouTubeIframeAPIAndFetchDuration(requestId);
    } else {
      this.detectRequestId++;
      this.isAutoDetecting = false;
      this.autoDetectFailed = false;
      this.autoDetectSuccess = false;
      this.destroyYouTubePlayer();
    }
  }

  // Extracts the YouTube video id from watch, short, embed, shorts, and live URLs.
  extractYouTubeVideoId(url: string): string | null {
    const trimmedUrl = url.trim();

    try {
      const parsedUrl = new URL(
        trimmedUrl,
        trimmedUrl.startsWith('http') ? undefined : 'https://www.youtube.com',
      );
      const hostname = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();

      if (hostname === 'youtu.be') {
        return this.normalizeYouTubeVideoId(parsedUrl.pathname.split('/')[1]);
      }

      if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
        const watchVideoId = parsedUrl.searchParams.get('v');
        if (watchVideoId) {
          return this.normalizeYouTubeVideoId(watchVideoId);
        }

        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        const videoPathIndex = pathParts.findIndex((part) =>
          ['embed', 'shorts', 'live', 'v'].includes(part),
        );
        if (videoPathIndex >= 0) {
          return this.normalizeYouTubeVideoId(pathParts[videoPathIndex + 1]);
        }
      }
    } catch {
      // Fall back to regex matching below.
    }

    const fallbackMatch = trimmedUrl.match(
      /(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/,
    );
    return this.normalizeYouTubeVideoId(fallbackMatch?.[1]);
  }

  // Loads the YouTube IFrame API if needed, then creates a hidden player to read duration.
  loadYouTubeIframeAPIAndFetchDuration(requestId = this.detectRequestId): void {
    if (!this.isBrowser) return;

    if (window.YT && window.YT.Player) {
      this.createYTPlayerAndGetDuration(requestId);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api');
    if (existingScript) {
      this.waitForYTAPIReady(requestId);
      return;
    }

    const script = document.createElement('script');
    script.id = 'youtube-iframe-api';
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);

    this.waitForYTAPIReady(requestId);
  }

  // Accepts only valid YouTube ids so playlist ids or malformed values are ignored.
  private normalizeYouTubeVideoId(
    videoId: string | null | undefined,
  ): string | null {
    const cleanVideoId = videoId?.match(/^[a-zA-Z0-9_-]{11}$/)?.[0];
    return cleanVideoId || null;
  }

  // Waits for the external YouTube script to expose YT.Player before continuing.
  private waitForYTAPIReady(requestId: number): void {
    this.clearApiReadyPoll();

    (window as any).onYouTubeIframeAPIReady = () => {
      if (requestId !== this.detectRequestId) return;

      this.createYTPlayerAndGetDuration(requestId);
    };

    const maxWait = 10000;
    const interval = 100;
    let waited = 0;

    this.apiReadyPollId = window.setInterval(() => {
      if (requestId !== this.detectRequestId) {
        this.clearApiReadyPoll();
        return;
      }

      if (window.YT && window.YT.Player) {
        this.clearApiReadyPoll();
        this.createYTPlayerAndGetDuration(requestId);
        return;
      }

      waited += interval;
      if (waited >= maxWait) {
        this.clearApiReadyPoll();
        this.failAutoDetect(requestId);
      }
    }, interval);
  }

  // Creates an off-screen YouTube player for the current video id.
  private createYTPlayerAndGetDuration(requestId: number): void {
    if (
      !this.isBrowser ||
      !this.youtubeVideoId ||
      requestId !== this.detectRequestId
    ) {
      return;
    }

    this.destroyYouTubePlayer(); // Clean up any previous player.

    // Create Hide Div to play video and get duration
    const playerDiv = document.createElement('div');
    playerDiv.id = 'yt-duration-player';
    playerDiv.style.position = 'absolute';
    playerDiv.style.left = '-9999px';
    playerDiv.style.top = '-9999px';
    playerDiv.style.width = '200px';
    playerDiv.style.height = '113px';
    document.body.appendChild(playerDiv);

    this.ytPlayer = new window.YT.Player('yt-duration-player', {
      videoId: this.youtubeVideoId,
      host: 'https://www.youtube.com',

      // youtube settings
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        modestbranding: 1,
        origin: window.location.origin,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          this.onYTPlayerReady(event, requestId);
        },
        onStateChange: (event: any) => {
          this.onYTPlayerStateChange(event);
        },
        onError: (event: any) => {
          this.onYTPlayerError(event, requestId);
        },
      },
    });
  }

  // Cues the video metadata when the hidden player is ready, then starts polling duration.
  private onYTPlayerReady(event: any, requestId: number): void {
    if (requestId !== this.detectRequestId) return;

    try {
      this.ytPlayerReady = true;
      event.target.cueVideoById(this.youtubeVideoId);
      this.pollForDuration(requestId);
    } catch {
      this.failAutoDetect(requestId);
    }
  }

  // Repeatedly calls getDuration until YouTube returns a real duration or times out.
  private pollForDuration(requestId: number): void {
    this.clearDurationPoll();

    const maxWait = 15000;
    const intervalMs = 250;
    let waited = 0;

    this.durationPollId = window.setInterval(() => {
      if (requestId !== this.detectRequestId) {
        this.clearDurationPoll();
        return;
      }

      try {
        const duration = this.ytPlayer.getDuration();
        if (duration > 0) {
          this.clearDurationPoll();
          this.setDurationFromAutoDetect(duration, requestId);
          return;
        }
      } catch {
        this.clearDurationPoll();
        this.failAutoDetect(requestId);
        return;
      }

      waited += intervalMs;
      if (waited >= maxWait) {
        this.clearDurationPoll();
        this.failAutoDetect(requestId);
      }
    }, intervalMs);
  }

  // Keeps the state-change hook available for YouTube player events.
  private onYTPlayerStateChange(event: any): void {
    // Polling handles duration detection; this hook is kept for player events.
  }

  // Handles YouTube player errors by falling back to manual duration entry.
  private onYTPlayerError(event: any, requestId: number): void {
    this.failAutoDetect(requestId);
  }

  // Saves the detected duration into the form and updates the UI success state.
  private setDurationFromAutoDetect(duration: number, requestId: number): void {
    if (requestId !== this.detectRequestId) return;

    this.durationInSeconds = Math.round(duration);
    this.autoDetectSuccess = true;
    this.isAutoDetecting = false;
    this.autoDetectFailed = false;

    const hours = Math.floor(this.durationInSeconds / 3600);
    const minutes = Math.floor((this.durationInSeconds % 3600) / 60);
    const seconds = this.durationInSeconds % 60;

    this.createLectureForm.patchValue({
      durationHours: hours,
      durationMinutes: minutes,
      durationSeconds: seconds,
    });

    this.formattedDuration = this.formatDuration(this.durationInSeconds);
    this.destroyYouTubePlayer();
    this._cdr.detectChanges();
  }

  // Marks auto-detection as failed and cleans up the hidden player.
  private failAutoDetect(requestId: number): void {
    if (requestId !== this.detectRequestId) return;

    this.isAutoDetecting = false;
    this.autoDetectFailed = true;
    this.autoDetectSuccess = false;
    this.destroyYouTubePlayer();
    this._cdr.detectChanges();
  }

  // Destroys the hidden YouTube player and removes its DOM element.
  private destroyYouTubePlayer(): void {
    if (!this.isBrowser) return;

    this.clearDurationPoll();

    if (this.ytPlayer) {
      try {
        this.ytPlayer.destroy();
      } catch {
        // Player already destroyed.
      }
      this.ytPlayer = null;
    }
    this.ytPlayerReady = false;

    document.querySelectorAll('#yt-duration-player').forEach((playerDiv) => {
      playerDiv.remove();
    });
  }

  // Clears the timer that waits for the YouTube IFrame API to load.
  private clearApiReadyPoll(): void {
    if (this.apiReadyPollId) {
      window.clearInterval(this.apiReadyPollId);
      this.apiReadyPollId = null;
    }
  }

  // Clears the timer that polls the hidden player for video duration.
  private clearDurationPoll(): void {
    if (this.durationPollId) {
      window.clearInterval(this.durationPollId);
      this.durationPollId = null;
    }
  }

  // Recalculates total seconds when the user edits hours, minutes, or seconds manually.
  onManualDurationChange(): void {
    const hours = this.createLectureForm.get('durationHours')?.value || 0;
    const minutes = this.createLectureForm.get('durationMinutes')?.value || 0;
    const seconds = this.createLectureForm.get('durationSeconds')?.value || 0;

    this.durationInSeconds = hours * 3600 + minutes * 60 + seconds;
    this.formattedDuration = this.formatDuration(this.durationInSeconds);
  }

  // Formats total seconds as HH:MM:SS for display.
  formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Validates the form and sends the create lecture request to the API.
  onSubmit(): void {
    if (this.createLectureForm.invalid) {
      this.createLectureForm.markAllAsTouched();
      this._notifications.showError(
        'Please fill in all required fields correctly.',
        'Validation Error',
      );
      return;
    }

    this.onManualDurationChange();

    if (this.durationInSeconds <= 0) {
      this._notifications.showError(
        'Video duration must be greater than 0 seconds.',
        'Duration Error',
      );
      return;
    }

    this.isSubmitting = true;

    const data: CreatedLectureRequest = {
      title: this.createLectureForm.get('title')?.value,
      videoUrl: this.createLectureForm.get('videoUrl')?.value,
      order: Number(this.createLectureForm.get('order')?.value),
      durationInSeconds: this.durationInSeconds,
      isPreview: this.createLectureForm.get('isPreview')?.value || false,
      sectionId: this.sectionId,
    };

    this._managementLectureService
      .createLecture(data)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: ApplicationResult<LectureWithInstructorResponse>) => {
          if (res.succeed && res.data) {
            this._notifications.showSuccess(
              res.message || 'Lecture created successfully',
              'Create Lecture Succeeded',
            );
            this._router.navigate(['/instructor/dashboard']);
          } else {
            this._notifications.showError(
              res.message || 'Failed to create lecture.',
              'Create Lecture Failed',
            );
          }
        },
        error: () => {
          this._notifications.showError(
            'An unexpected error occurred. Please try again.',
            'Error',
          );
        },
      });
  }
}
