// src/app/pages/admin/admin-page.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SurveyApiService } from '../../services/survey-api.service';
import { Survey } from '../../models/api-model';

@Component({
  standalone: true,
  imports: [
    NgIf, NgFor, AsyncPipe, RouterLink, DatePipe,
    MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatRippleModule,
    MatMenuModule, MatSnackBarModule
  ],
  providers: [SurveyApiService],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ],
  styles: [`
    .dashboard-container {
      max-width: 1024px;
      margin: 0 auto;
      padding: 24px;
    }
    .header-section {
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }
    .create-card {
      height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border: 1px solid #dadce0;
      background: #fff;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .create-card:hover {
      border-color: transparent;
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
    }
    .plus-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #dc362e; /* Google Forms red-ish color for the plus */
      margin-bottom: 12px;
    }
    .survey-card {
      height: 200px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: box-shadow 0.2s;
      border: 1px solid #dadce0;
      position: relative;
    }
    .survey-card:hover {
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
    }
    .card-preview {
      flex: 1;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #dadce0;
    }
    .card-footer {
      padding: 12px 16px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .survey-info {
      overflow: hidden;
    }
    .survey-title {
      font-weight: 500;
      font-size: 14px;
      color: #202124;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .survey-meta {
      font-size: 12px;
      color: #5f6368;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .menu-btn {
      color: #5f6368;
    }
  `],
  template: `
  <div class="dashboard-container">
    <div class="header-section">
      <h2 style="font-weight:400; color:#202124; margin:0;">Recent forms</h2>
    </div>

    <ng-container *ngIf="surveys; else loading">
      <div class="grid" [@fadeIn]>
        <!-- Create New Card -->
        <mat-card class="create-card" matRipple routerLink="/admin/surveys/new">
          <mat-icon class="plus-icon">add_circle_outline</mat-icon>
          <span style="font-weight:500; color:#202124;">Blank form</span>
        </mat-card>

        <!-- Existing Surveys -->
        <mat-card *ngFor="let s of surveys" class="survey-card" matRipple [routerLink]="['/admin/surveys', s.id]">
          <div class="card-preview">
            <mat-icon style="font-size:48px; height:48px; width:48px; color:#dadce0;">description</mat-icon>
          </div>
          <div class="card-footer">
            <div class="survey-info">
              <div class="survey-title">{{ s.title || 'Untitled form' }}</div>
              <div class="survey-meta">
                <mat-icon style="font-size:16px; height:16px; width:16px;">storage</mat-icon>
                ID: {{ s.id }}
              </div>
            </div>
            
            <!-- Actions Menu -->
            <button mat-icon-button class="menu-btn" [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item [routerLink]="['/admin/surveys', s.id]">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
              <button mat-menu-item [routerLink]="['/admin/surveys', s.id, 'responses']">
                <mat-icon>assessment</mat-icon>
                <span>Responses</span>
              </button>
              <button mat-menu-item (click)="openSurvey(s.id!)">
                <mat-icon>visibility</mat-icon>
                <span>Fill / Preview</span>
              </button>
              <button mat-menu-item (click)="shareSurvey(s.id!)">
                <mat-icon>share</mat-icon>
                <span>Share Link</span>
              </button>
            </mat-menu>
          </div>
        </mat-card>
      </div>

      <div *ngIf="surveys.length === 0" style="margin-top: 40px; text-align: center; color: #5f6368;">
        No forms yet. Click "Blank form" to start a new one.
      </div>
    </ng-container>

    <ng-template #loading>
      <div class="loading-container">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
      </div>
    </ng-template>
  </div>
  `
})
export class AdminPageComponent implements OnInit {
  private svc = inject(SurveyApiService);
  private snack = inject(MatSnackBar);
  surveys: Survey[] | null = null;

  constructor(private router: Router) { }

  ngOnInit() {
    this.svc.getAllSurveys().subscribe(s => this.surveys = s ?? []);
  }

  openSurvey(id: number) {
    this.router.navigate(['/s', id]);
  }

  shareSurvey(id: number) {
    const urlTree = this.router.createUrlTree(['/s', id]);
    const url = `${window.location.origin}/survey${this.router.serializeUrl(urlTree)}`;
    navigator.clipboard.writeText(url).then(() => {
      this.snack.open('Link copied to clipboard', 'Close', { duration: 2500 });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      this.snack.open('Failed to copy link', 'Close', { duration: 2500 });
    });
  }
}
