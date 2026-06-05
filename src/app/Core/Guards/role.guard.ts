import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../Services/Auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const _authService = inject(AuthService);
  const _router = inject(Router);
  const _platformId = inject(PLATFORM_ID);

  // SSR guard – skip check on server
  if (!isPlatformBrowser(_platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    _router.navigate(['/login']);
    return false;
  }

  const userRoles = _authService.getUserRoles();

  if (userRoles.length === 0) {
    _router.navigate(['/login']);
    return false;
  }

  // Get the required roles from route data
  const requiredRoles: string[] = route.data?.['roles'] ?? [];

  // If no required roles specified, allow access
  if (requiredRoles.length === 0) {
    return true;
  }

  // Admin – redirect to student home (temporary – will be updated later)
  if (userRoles.includes('Admin')) {
    if (requiredRoles.includes('Student')) {
      return true;
    }
    _router.navigate(['/student/home']);
    return false;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = userRoles.some((role) =>
    requiredRoles.includes(role),
  );

  if (hasRequiredRole) {
    return true;
  }

  // Redirect based on the user's actual role
  if (userRoles.includes('Student')) {
    _router.navigate(['/student/home']);
  } else if (userRoles.includes('Instructor')) {
    _router.navigate(['/instructor/dashboard']);
  } else if (userRoles.includes('Admin')) {
    _router.navigate(['/admin/dashboard']);
  }

  return false;
};
