/**
 * Matches the backend ErrorResponse class in Courses.Api/ErrorHandler/ErrorResponse.cs
 *
 * Backend shape (camelCase via JsonNamingPolicy.CamelCase):
 * {
 *   "statusCode": number,
 *   "message": string[] | null
 * }
 */
export interface ErrorResponse {
  statusCode: number;
  message: string[] | null;
}

/**
 * Matches the backend ResponseValidationError class in Courses.Api/ErrorHandler/ResponseValidationError.cs
 * Extends ErrorResponse with an additional `errors` array.
 *
 * Backend shape (camelCase via JsonNamingPolicy.CamelCase):
 * {
 *   "statusCode": 400,
 *   "message": string[],
 *   "errors": string[] | null
 * }
 */
export interface ResponseValidationError extends ErrorResponse {
  errors: string[] | null;
}
