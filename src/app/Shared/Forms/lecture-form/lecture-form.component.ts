import {
  Component,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';

declare global {
  interface Window {
    YT: any;
  }
}

import {
  LectureFormData,
  LectureFormInitialData,
} from '../../../Core/Interfaces/Lectures/lecture-form-data';

@Component({
  selector: 'app-lecture-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    MessageModule,
    CardModule,
    RouterLink,
  ],
  templateUrl: './lecture-form.component.html',
  styleUrl: './lecture-form.component.scss',
})
export class LectureFormComponent implements OnInit, OnDestroy, OnChanges {
  // ─── Configurable Inputs ───

  /** Text displayed on the submit button. */
  @Input() submitButtonText: string = 'Create Lecture';

  /** Icon class displayed on the submit button. */
  @Input() submitButtonIcon: string = 'pi pi-plus';

  /** RouterLink path for the back button. */
  @Input() backLink: string = '/instructor/dashboard';

  /** Text displayed on the back button. */
  @Input() backButtonText: string = 'Back to Dashboard';

  /** Icon class displayed on the back button. */
  @Input() backButtonIcon: string = 'pi pi-arrow-left';

  /** Whether the parent is currently submitting the form data to the API. */
  @Input() isSubmitting: boolean = false;

  /** Optional initial data to pre-populate the form (used in update mode). */
  @Input() initialData?: LectureFormInitialData;

  // ─── Outputs ───

  /** Emits the validated form data when the user submits a valid form. */
  @Output() formSubmit = new EventEmitter<LectureFormData>();

  // ─── Form & State ───

  lectureForm!: FormGroup;
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
    private readonly _cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.initForm();
    if (this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['initialData'] &&
      changes['initialData'].currentValue &&
      !changes['initialData'].firstChange
    ) {
      this.populateForm(changes['initialData'].currentValue);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.detectRequestId++;
      this.clearApiReadyPoll();
      this.destroyYouTubePlayer();
    }
  }

  // ─── Form Initialization ───

  initForm(): void {
    this.lectureForm = this.fb.group({
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

  /** Pre-populates the form with existing lecture data (for update mode). */
  populateForm(data: LectureFormInitialData): void {
    const durationInSeconds = data.durationInSeconds ?? 0;
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    this.durationInSeconds = durationInSeconds;
    this.formattedDuration = this.formatDuration(this.durationInSeconds);

    this.lectureForm.patchValue({
      title: data.title ?? '',
      videoUrl: data.videoUrl ?? '',
      order: data.order ?? 1,
      durationHours: hours,
      durationMinutes: minutes,
      durationSeconds: seconds,
      isPreview: data.isPreview ?? false,
    });

    // Show the duration immediately from saved data (no need to re-detect from YouTube)
    if (durationInSeconds > 0 && data.videoUrl) {
      this.autoDetectSuccess = true;
      this.youtubeVideoId = this.extractYouTubeVideoId(data.videoUrl);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.lectureForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // ─── Form Submission ───

  /** Validates the form and emits formSubmit event with the data if valid. */
  onFormSubmit(): void {
    if (this.lectureForm.invalid) {
      this.lectureForm.markAllAsTouched();
      return;
    }

    this.onManualDurationChange();

    if (this.durationInSeconds <= 0) {
      return;
    }

    const formData: LectureFormData = {
      title: this.lectureForm.get('title')?.value,
      videoUrl: this.lectureForm.get('videoUrl')?.value,
      order: Number(this.lectureForm.get('order')?.value),
      durationInSeconds: this.durationInSeconds,
      isPreview: this.lectureForm.get('isPreview')?.value || false,
    };

    this.formSubmit.emit(formData);
  }

  // ─── YouTube Duration Detection ───

  /** Runs whenever the video URL changes and starts YouTube duration detection when possible. */
  onVideoUrlChange(): void {
    if (!this.isBrowser) return;

    const url = (this.lectureForm.get('videoUrl')?.value || '').trim();
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

  /** Extracts the YouTube video id from watch, short, embed, shorts, and live URLs. */
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

  /** Loads the YouTube IFrame API if needed, then creates a hidden player to read duration. */
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

  /** Accepts only valid YouTube ids so playlist ids or malformed values are ignored. */
  private normalizeYouTubeVideoId(
    videoId: string | null | undefined,
  ): string | null {
    const cleanVideoId = videoId?.match(/^[a-zA-Z0-9_-]{11}$/)?.[0];
    return cleanVideoId || null;
  }

  /** Waits for the external YouTube script to expose YT.Player before continuing. */
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

  /** Creates an off-screen YouTube player for the current video id. */
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

  /** Cues the video metadata when the hidden player is ready, then starts polling duration. */
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

  /** Repeatedly calls getDuration until YouTube returns a real duration or times out. */
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

  /** Keeps the state-change hook available for YouTube player events. */
  private onYTPlayerStateChange(event: any): void {
    // Polling handles duration detection; this hook is kept for player events.
  }

  /** Handles YouTube player errors by falling back to manual duration entry. */
  private onYTPlayerError(event: any, requestId: number): void {
    this.failAutoDetect(requestId);
  }

  /** Saves the detected duration into the form and updates the UI success state. */
  private setDurationFromAutoDetect(duration: number, requestId: number): void {
    if (requestId !== this.detectRequestId) return;

    this.durationInSeconds = Math.round(duration);
    this.autoDetectSuccess = true;
    this.isAutoDetecting = false;
    this.autoDetectFailed = false;

    const hours = Math.floor(this.durationInSeconds / 3600);
    const minutes = Math.floor((this.durationInSeconds % 3600) / 60);
    const seconds = this.durationInSeconds % 60;

    this.lectureForm.patchValue({
      durationHours: hours,
      durationMinutes: minutes,
      durationSeconds: seconds,
    });

    this.formattedDuration = this.formatDuration(this.durationInSeconds);
    this.destroyYouTubePlayer();
    this._cdr.detectChanges();
  }

  /** Marks auto-detection as failed and cleans up the hidden player. */
  private failAutoDetect(requestId: number): void {
    if (requestId !== this.detectRequestId) return;

    this.isAutoDetecting = false;
    this.autoDetectFailed = true;
    this.autoDetectSuccess = false;
    this.destroyYouTubePlayer();
    this._cdr.detectChanges();
  }

  /** Destroys the hidden YouTube player and removes its DOM element. */
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

  /** Clears the timer that waits for the YouTube IFrame API to load. */
  private clearApiReadyPoll(): void {
    if (this.apiReadyPollId) {
      window.clearInterval(this.apiReadyPollId);
      this.apiReadyPollId = null;
    }
  }

  /** Clears the timer that polls the hidden player for video duration. */
  private clearDurationPoll(): void {
    if (this.durationPollId) {
      window.clearInterval(this.durationPollId);
      this.durationPollId = null;
    }
  }

  // ─── Manual Duration ───

  /** Recalculates total seconds when the user edits hours, minutes, or seconds manually. */
  onManualDurationChange(): void {
    const hours = this.lectureForm.get('durationHours')?.value || 0;
    const minutes = this.lectureForm.get('durationMinutes')?.value || 0;
    const seconds = this.lectureForm.get('durationSeconds')?.value || 0;

    this.durationInSeconds = hours * 3600 + minutes * 60 + seconds;
    this.formattedDuration = this.formatDuration(this.durationInSeconds);
  }

  /** Formats total seconds as HH:MM:SS for display. */
  formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
