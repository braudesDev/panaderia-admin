// src/main.ts
import { initializeApp } from 'firebase/app';
import { environment } from './app/environments/environment';

initializeApp(environment.firebase); // <-- Inicializa Firebase aquí

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
