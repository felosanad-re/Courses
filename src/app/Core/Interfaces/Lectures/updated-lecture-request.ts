export interface UpdatedLectureRequest {
  id: number;
  title: string;
  videoUrl: string;
  order: number;
  durationInSeconds: number;
  isPreview: boolean;
  sectionId: number;
}
