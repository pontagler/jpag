import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        // Scroll window to top on every navigation
        scrollPositionRestoration: 'top',
        // Enable anchor link scrolling (e.g., #section)
        anchorScrolling: 'enabled'
      })
    )
  ]
};
