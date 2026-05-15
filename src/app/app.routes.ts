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
        path: 'confirmAccount/:userId/:token',
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
      {
        path: 'checkConfirm',
        loadComponent: () =>
          import(`./Pages/Auth/check-confirm/check-confirm.component`).then(
            (c) => c.CheckConfirmComponent,
          ),
      },
      {
        path: 'selectRole',
        loadComponent: () =>
          import(`./Pages/onboarding/select-role/select-role.component`).then(
            (c) => c.SelectRoleComponent,
          ),
      },
      {
        path: 'set-instructor-role',
        loadComponent: () =>
          import(
            `./Pages/onboarding/set-instructor-role/set-instructor-role.component`
          ).then((c) => c.SetInstructorRoleComponent),
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
  // student
  {
    path: 'student',
    loadComponent: () =>
      import(`./Layouts/student-layout/student-layout.component`).then(
        (c) => c.StudentLayoutComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        loadComponent: () =>
          import(`./Pages/Student/home/home.component`).then(
            (c) => c.HomeComponent,
          ),
      },
      {
        path: 'course-details/:courseId',
        loadComponent: () =>
          import(
            `./Pages/Student/course-details/course-details.component`
          ).then((c) => c.CourseDetailsComponent),
      },
      {
        path: 'my-courses',
        loadComponent: () =>
          import(`./Pages/Student/my-courses/my-courses.component`).then(
            (c) => c.MyCoursesComponent,
          ),
      },
      {
        path: 'view-course',
        loadComponent: () =>
          import(`./Pages/Student/my-courses/my-courses.component`).then(
            (c) => c.MyCoursesComponent,
          ),
      },
      {
        path: 'view-lecture/:courseId',
        loadComponent: () =>
          import(`./Pages/Student/view-lecture/view-lecture.component`).then(
            (c) => c.ViewLectureComponent,
          ),
      },
    ],
  },
];
