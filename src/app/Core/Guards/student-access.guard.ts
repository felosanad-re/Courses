import { CanActivateFn } from '@angular/router';
import { roleGuard } from './role.guard';

export const studentAccessGuard: CanActivateFn = (route, state) => {
  const path = state.url.split('?')[0].replace(/\/$/, '');
  const isPublicStudentPage =
    path === '/student' ||
    path === '/student/home' ||
    path.startsWith('/student/course-details/');

  return isPublicStudentPage ? true : roleGuard(route, state);
};
