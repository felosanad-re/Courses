import { Routes } from '@angular/router';

export const routes: Routes = [
  // Auth
  {
    path: '',
    loadComponent: () =>
      import('./Layouts/auth-layout/auth-layout.component').then(
        (c) => c.AuthLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import(`./Pages/Auth/login/login.component`).then(
            (c) => c.LoginComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import(`./Pages/Auth/register/register.component`).then(
            (c) => c.RegisterComponent,
          ),
      },
      {
        path: 'confirmAccount',
        loadComponent: () =>
          import(`./Pages/Auth/confirm-account/confirm-account.component`).then(
            (c) => c.ConfirmAccountComponent,
          ),
      },
      {
        path: 'checkAccount',
        loadComponent: () =>
          import(`./Pages/Auth/check-account/check-account.component`).then(
            (c) => c.CheckAccountComponent,
          ),
      },
      {
        path: 'checkOtp',
        loadComponent: () =>
          import(`./Pages/Auth/check-otp/check-otp.component`).then(
            (c) => c.CheckOTPComponent,
          ),
      },
      {
        path: 'forgetPassword',
        loadComponent: () =>
          import(`./Pages/Auth/forget-password/forget-password.component`).then(
            (c) => c.ForgetPasswordComponent,
          ),
      },
    ],
  },
  // Instructor
  {
    path: 'instructor',
    loadComponent: () =>
      import(`./Layouts/instructor-layout/instructor-layout.component`).then(
        (c) => c.InstructorLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            `./Pages/Instructors/instructor-dashboard/instructor-dashboard.component`
          ).then((c) => c.InstructorDashboardComponent),
      },
      {
        path: 'create-course',
        loadComponent: () =>
          import(
            `./Pages/Instructors/create-course/create-course.component`
          ).then((c) => c.CreateCourseComponent),
      },
    ],
  },
];
