import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SurveyResponseApiService } from '../../services/survey-response-api.service';
import { SurveyApiService } from '../../services/survey-api.service';
import { Survey, SurveyResponse } from '../../models/api-model';

@Component({
    standalone: true,
    imports: [
        NgIf, NgFor, AsyncPipe, DatePipe, RouterLink,
        MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatToolbarModule
    ],
    template: `
    <div class="container">
      <mat-toolbar color="primary" class="toolbar">
        <button mat-icon-button routerLink="/admin">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Responses: {{ survey?.title }}</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="exportCsv()">
          <mat-icon>download</mat-icon>&nbsp;Export CSV
        </button>
      </mat-toolbar>

      <div class="content">
        <mat-card>
          <div *ngIf="responses?.length === 0" style="padding: 24px; text-align: center; color: #666;">
            No responses yet.
          </div>

          <table mat-table [dataSource]="responses" *ngIf="responses && responses.length > 0" class="mat-elevation-z0">
            
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef> ID </th>
              <td mat-cell *matCellDef="let element"> {{element.id}} </td>
            </ng-container>

            <!-- Answers Column (Summary) -->
            <ng-container matColumnDef="answers">
              <th mat-header-cell *matHeaderCellDef> Answers Summary </th>
              <td mat-cell *matCellDef="let element"> 
                {{ element.userInputs?.length || 0 }} answers
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f0f2f5;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .spacer {
      flex: 1;
    }
    .content {
      padding: 24px;
      max-width: 1024px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
  `]
})
export class SurveyResponsesComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private responseSvc = inject(SurveyResponseApiService);
    private surveySvc = inject(SurveyApiService);

    surveyId!: number;
    survey?: Survey;
    responses: SurveyResponse[] = [];
    displayedColumns: string[] = ['id', 'answers'];

    ngOnInit() {
        this.surveyId = Number(this.route.snapshot.paramMap.get('id'));

        // Load survey details
        this.surveySvc.getSurvey(this.surveyId).subscribe(s => this.survey = s);

        // Load responses
        this.responseSvc.getResponses(this.surveyId).subscribe(r => this.responses = r);
    }

    exportCsv() {
        this.responseSvc.downloadExport(this.surveyId);
    }
}
