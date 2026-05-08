export interface DeleteCoursesResult {
  deletedIds: number[];
  notFoundIds: number[];
  unauthorizedIds: number[];
}