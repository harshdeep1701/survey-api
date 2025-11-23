// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink,
    MatToolbarModule, MatButtonModule, MatIconModule
  ],
  styles: [`
    .app-shell { min-height: 100vh; background-color: #f0f2f5; }
    .content { max-width: 100%; margin: 0 auto; }
    .spacer { flex: 1; }
    .logo { font-size: 22px; font-weight: 500; color: #5f6368; text-decoration: none; display: flex; align-items: center; gap: 8px; }
    mat-toolbar { background: white !important; color: #5f6368 !important; border-bottom: 1px solid #dadce0; }
  `],
  template: `
  <div class="app-shell">
    <mat-toolbar>
      <a routerLink="/admin" class="logo">
        <mat-icon style="color: #673ab7;">description</mat-icon>
        <span>Forms Clone</span>
      </a>
      
      <span class="spacer"></span>
      
      <!-- Only show these if we are in admin mode - for now we just show them always or we could check route -->
      <a mat-button routerLink="/admin">Dashboard</a>
      <a mat-button routerLink="/s/1" target="_blank">View Demo</a>
    </mat-toolbar>

    <div class="content">
      <router-outlet></router-outlet>
    </div>
  </div>
  `
})
export class AppComponent {}
