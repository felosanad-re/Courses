export interface ApplicationResult<T> {
  succeeded: boolean;
  message?: string;
  errors: string[] | null;
  data: T;
}
