export interface CreatedLectureRequest {
  title: string;
  videoUrl: string;
  order: number;
  durationInSeconds: number;
  isPreview: boolean;
  sectionId: number;
}
