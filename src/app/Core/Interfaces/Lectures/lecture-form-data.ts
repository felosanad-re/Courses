/** Data emitted by the lecture-form when the form is valid and submitted. */
export interface LectureFormData {
  title: string;
  videoUrl: string;
  order: number;
  durationInSeconds: number;
  isPreview: boolean;
}

/** Initial data used to pre-populate the form (e.g. for update mode). */
export interface LectureFormInitialData {
  title?: string;
  videoUrl?: string;
  order?: number;
  durationInSeconds?: number;
  isPreview?: boolean;
}
