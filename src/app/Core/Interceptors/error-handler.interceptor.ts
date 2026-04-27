import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ErrorHandlerService } from '../Services/error-handler.service';

/**
 * Global HTTP error handler interceptor.
 *
 * Compatible with the backend ErrorHandler in Courses.Api:
 * - `ErrorResponse`      → { statusCode, message }
 * - `ResponseValidationError` → { statusCode, message, errors }
 * - `ExceptionMiddleware` → catches unhandled exceptions and returns ErrorResponse(500)
 *
 * All HTTP errors are routed through `ErrorHandlerService.handleHttpError()`
 * so the rest of the app can subscribe to `ErrorHandlerService.errors$` and
 * react uniformly (toast, snackbar, redirect, etc.).
 */
export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const handled = errorHandler.handleHttpError(error);

      // Specific side-effects based on status code
      switch (handled.statusCode) {
        case 401:
          // Unauthorized – could redirect to login
          // e.g. inject(Router).navigate(['/login']);
          break;
        case 403:
          // Forbidden – could redirect to access-denied page
          break;
        case 404:
          // Not Found – could redirect to 404 page
          break;
        default:
          break;
      }

      // Re-throw so individual subscribers can also handle if needed
      return throwError(() => error);
    }),
  );
};
