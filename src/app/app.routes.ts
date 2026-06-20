import { Routes } from '@angular/router';
import { roleGuard } from './Core/Guards/role.guard';

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
    canActivate: [roleGuard],
    data: { roles: ['Instructor'] },
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
            `./Pages/Instructors/Management-Course/create-course/create-course.component`
          ).then((c) => c.CreateCourseComponent),
      },
      {
        path: 'update-course/:courseId',
        loadComponent: () =>
          import(
            `./Pages/Instructors/Management-Course/update-course/update-course.component`
          ).then((c) => c.UpdateCourseComponent),
      },
      {
        path: 'create-section/:courseId',
        loadComponent: () =>
          import(
            `./Pages/Instructors/Management-Course/create-section/create-section.component`
          ).then((c) => c.CreateSectionComponent),
      },
      {
        path: 'course-sections-details/:courseId',
        loadComponent: () =>
          import(
            `./Pages/Instructors/course-sections-details/course-sections-details.component`
          ).then((c) => c.CourseSectionsDetailsComponent),
      },
      {
        path: 'create-lecture/:courseId/:sectionId',
        loadComponent: () =>
          import(
            `./Pages/Instructors/Management-Course/create-lectures/create-lectures.component`
          ).then((c) => c.CreateLecturesComponent),
      },
      {
        path: 'update-lecture/:courseId/:sectionId/:lectureId',
        loadComponent: () =>
          import(
            `./Pages/Instructors/Management-Course/update-lecture/update-lecture.component`
          ).then((c) => c.UpdateLectureComponent),
      },
      {
        path: 'online-sessions/create/:courseId/:sectionId',
        loadComponent: () =>
          import(
            `./Pages/Instructors/Online-Sessions/create-online-session/create-online-session.component`
          ).then((c) => c.CreateOnlineSessionComponent),
      },
      {
        path: 'students',
        loadComponent: () =>
          import(
            `./Pages/Instructors/instructor-students/instructor-students.component`
          ).then((c) => c.InstructorStudentsComponent),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import(`./Pages/Instructors/my-courses/my-courses.component`).then(
            (c) => c.MyCoursesComponent,
          ),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import(
            `./Pages/Instructors/instructor-analyze/instructor-analyze.component`
          ).then((c) => c.InstructorAnalyzeComponent),
      },
      {
        path: 'earnings',
        loadComponent: () =>
          import(
            `./Pages/Instructors/earning-instructor/earning-instructor.component`
          ).then((c) => c.EarningInstructorComponent),
      },
    ],
  },
  // student
  {
    path: 'student',
    canActivate: [roleGuard],
    data: { roles: ['Student'] },
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
        path: 'payment/:enrollmentId',
        loadComponent: () =>
          import(`./Pages/Student/payment/payment.component`).then(
            (c) => c.PaymentComponent,
          ),
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
      {
        path: 'refund/:enrollmentId/:courseId',
        loadComponent: () =>
          import(`./Pages/Student/refunded/refunded.component`).then(
            (c) => c.RefundedComponent,
          ),
      },
    ],
  },
];
