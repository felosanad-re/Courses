export class EnrollmentsParams {
  search?: string | null;
  sorting?: string | null;
  maxPageSize: number = 10;
  pageIndex: number = 1;
  pageSize: number = 5;
}
