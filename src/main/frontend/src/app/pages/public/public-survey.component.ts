import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { SurveyResponseApiService } from '../../services/survey-response-api.service';
import { DynamicFormComponent } from '../../components/dynamic-form/dynamic-form.component';
import { SurveyApiService } from '../../services/survey-api.service';
import { Survey, UserInputDTO, SurveyResponseSaveRequest } from '../../models/api-model';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  imports: [NgIf, MatCardModule, MatIconModule, DynamicFormComponent],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ],
  styles: [`
    .public-survey-container {
      max-width: 640px;
      margin: 0 auto;
      padding-bottom: 64px;
    }
    .survey-header-card {
      background: white;
      border: 1px solid #dadce0;
      border-radius: 8px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      margin-bottom: 12px;
      position: relative;
      overflow: hidden;
      padding: 24px;
    }
    .header-top-strip {
      height: 10px;
      background-color: #673ab7; /* Google Forms Purple */
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
    h1 {
      font-size: 32px;
      font-weight: 400;
      margin: 16px 0 12px 0;
      font-family: 'Google Sans', Roboto, Arial, sans-serif;
    }
    p {
      font-size: 14px;
      color: #202124;
      margin-bottom: 12px;
    }
    .required-note {
      color: #d93025;
      font-size: 12px;
      margin-top: 12px;
      border-top: 1px solid #dadce0;
      padding-top: 12px;
    }
    a {
      color: #1a73e8;
      text-decoration: none;
      font-size: 14px;
    }
    a:hover {
      text-decoration: underline;
    }
  `],
  template: `
  <div class="public-survey-container">
    <ng-container *ngIf="!success; else successTpl">
        <div class="survey-header-card" *ngIf="survey" [@fadeIn]>
            <div class="header-top-strip"></div>
            <h1>{{ survey.title }}</h1>
            <p *ngIf="survey.description">{{ survey.description }}</p>
            <div class="required-note">* Indicates required question</div>
        </div>
        
        <app-dynamic-form *ngIf="survey" [survey]="survey" (submitted)="onFormSubmitted($event)"></app-dynamic-form>
    </ng-container>

    <ng-template #successTpl>
      <div class="survey-header-card" [@fadeIn]>
        <div class="header-top-strip"></div>
        <h1>{{ survey?.title }}</h1>
        <div style="margin-top: 24px;">
            <p>Your response has been recorded.</p>
            <a href="#" (click)="reload($event)">Submit another response</a>
        </div>
      </div>
    </ng-template>
  </div>
  `
})
export class PublicSurveyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private surveys = inject(SurveyApiService);
  private responses = inject(SurveyResponseApiService);
  private snack = inject(MatSnackBar);

  survey?: Survey;
  success = false;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.surveys.getSurvey(id).subscribe(s => this.survey = s);
  }

  reload(e: Event) {
    e.preventDefault();
    window.location.reload();
  }

  onFormSubmitted(fd: FormData) {
    if (!this.survey?.id || !this.survey.inputs?.length) return;

    const inputsByOrder = new Map<number, { id: number; type?: string }>();
    this.survey.inputs.forEach(i => {
      if (typeof i.orderIndex === 'number' && typeof i.id === 'number') {
        inputsByOrder.set(i.orderIndex, { id: i.id, type: i.type });
      }
    });

    const userInputs: UserInputDTO[] = [];
    let attachedFile: File | undefined;

    // Walk through each survey input and extract values from FormData based on orderIndex
    for (const input of this.survey.inputs) {
      const order = input.orderIndex!;
      const key = `q_${order}`;
      const mapEntry = inputsByOrder.get(order);
      if (!mapEntry) continue;

      // Handle values by type
      switch (input.type) {
        case 'CHECKBOX': {
          const all = fd.getAll(key).map(v => String(v));
          const value = all.join(','); // API requires a single string
          userInputs.push({ inputId: mapEntry.id, value });
          break;
        }
        case 'FILE': {
          // pick file to send as the top-level "file" multipart part
          const f = fd.get(key);
          if (f instanceof File) attachedFile = f;
          // For DTO we still push empty or file name as value (optional)
          userInputs.push({ inputId: mapEntry.id, value: '' });
          break;
        }
        default: {
          const v = fd.get(key);
          userInputs.push({ inputId: mapEntry.id, value: v ? String(v) : '' });
        }
      }
    }

    const dto: SurveyResponseSaveRequest = { userInputs };

    this.responses.submitResponseObject(this.survey.id, dto, attachedFile)
      .subscribe({
        next: () => {
          this.success = true;
          // Prevent back navigation by pushing the current state again
          // So if they press back, they stay here.
          window.history.pushState(null, '', window.location.href);
          window.onpopstate = () => {
            window.history.pushState(null, '', window.location.href);
          };
        },
        error: () => this.snack.open('Submission failed. Please try again.', 'Close', { duration: 3000 })
      });
  }
}
