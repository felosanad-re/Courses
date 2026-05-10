import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/api';

export interface HandledError {
  statusCode: number;
  messages: string[];
  errors?: string[] | null;
}

/**
 * Global error handler service that mirrors the backend ErrorHandler logic.
 * Centralists error parsing, default messages, and UI notification.
 */
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly _errors$ = new BehaviorSubject<HandledError | null>(null);
  public readonly errors$ = this._errors$.asObservable();

  constructor(private readonly _message: MessageService) {}

  /**
   * Returns the default message for a given HTTP status code.
   * Mirrors `ErrorResponse.GetDefaultMessageError` on the backend.
   */
  getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Invalid request data';
      case 401:
        return 'Unauthorized access';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Internal server error';
      default:
        return 'Unexpected error occurred';
    }
  }

  /**
   * Parses an HTTP error response and pushes a HandledError to the stream.
   * Handles both `ErrorResponse` and `ResponseValidationError` shapes from the backend.
   */
  handleHttpError(error: any): HandledError {
    let statusCode = 0;
    let messages: string[] = [];
    let validationErrors: string[] | null = null;

    if (error?.status) {
      statusCode = error.status;
    }

    // Try to extract the backend error body
    const body = error?.error;

    if (body && typeof body === 'object') {
      // Backend returns { statusCode, message, errors? }
      if (body.statusCode) {
        statusCode = body.statusCode;
      }

      // Handle message as array or string
      if (Array.isArray(body.message) && body.message.length > 0) {
        messages = body.message;
      } else if (typeof body.message === 'string' && body.message) {
        messages = [body.message];
      }

      // ResponseValidationError has an `errors` array
      if (Array.isArray(body.errors) && body.errors.length > 0) {
        validationErrors = body.errors;
        // Merge validation errors into messages if messages is empty
        if (messages.length === 0) {
          messages = [...body.errors];
        }
      }

      // Handle object errors: { "Password": ["error"], "Email": ["error"] }
      if (body.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)) {
        Object.entries(body.errors).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((msg: string) => {
              messages.push(msg);
            });
          } else if (typeof value === 'string') {
            messages.push(value);
          }
        });
      }
    }

    // Fallback to default messages if none were extracted
    if (messages.length === 0) {
      messages = [this.getDefaultMessage(statusCode)];
    }

    const handledError: HandledError = {
      statusCode,
      messages,
      errors: validationErrors,
    };

    this._errors$.next(handledError);

    // Show toast for each error message
    messages.forEach((msg) => {
      this._message.add({
        severity: 'error',
        summary: 'Error',
        detail: msg,
      });
    });

    return handledError;
  }

  /** Clear the current error state */
  clearError(): void {
    this._errors$.next(null);
  }
}
