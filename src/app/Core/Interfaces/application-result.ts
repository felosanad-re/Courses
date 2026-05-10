export interface ApplicationResult<T> {
  succeed: boolean;
  message?: string;
  errors: string[] | null;
  data: T;
}
