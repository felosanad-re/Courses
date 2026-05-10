import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { errorHandlerInterceptor } from './Core/Interceptors/error-handler.interceptor';
import { tokenHandlerInterceptor } from './Core/Interceptors/token-handler.interceptor';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([tokenHandlerInterceptor, errorHandlerInterceptor]),
    ),
    provideAnimations(),
    MessageService,
  ],
};
