import { isPlatformBrowser } from '@angular/common';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';

/**
 * Token interceptor that attaches the JWT Bearer token to every outgoing HTTP request.
 *
 * Compatible with the backend JWT Bearer authentication configured in
 * Courses.Api/Extensions/ApplicationServices.cs (JwtBearerDefaults.AuthenticationScheme).
 *
 * Token is read from localStorage under the key 'token'.
 * If no token exists, the request is forwarded unchanged.
 */
export const tokenHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = Inject(PLATFORM_ID);
  let token: string | null = null;
  if (isPlatformBrowser(platformId) && !req.headers.has('Authorization')) {
    token = localStorage.getItem('token');
  }

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }

  return next(req);
};
