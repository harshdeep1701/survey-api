// src/app/components/dynamic-form/dynamic-form.component.ts
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Survey, SurveyInput } from '../../models/api-model';

@Component({
  standalone: true,
  selector: 'app-dynamic-form',
  imports: [
    CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatRadioModule, MatButtonModule, MatDividerModule, MatIconModule
  ],
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 640px;
      margin: 0 auto;
    }
    .question-card {
      background: white;
      border: 1px solid #dadce0;
      border-radius: 8px;
      padding: 24px;
      transition: all 0.2s;
    }
    .question-card.error-state {
      border: 1px solid #d93025;
      background-color: #fce8e6; /* Light red bg for error, optional but Google forms usually just does red text/border */
      background-color: white; /* Stick to white */
    }
    .question-title {
      font-size: 16px;
      font-weight: 400;
      margin-bottom: 16px;
      letter-spacing: .1px;
      line-height: 24px;
      color: #202124;
    }
    .required-star {
      color: #d93025;
      margin-left: 4px;
    }
    .error-text {
      color: #d93025;
      font-size: 12px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      max-width: 640px;
      margin: 24px auto 0;
    }
    /* Override Material styles to look more like Google Forms */
    ::ng-deep .mat-mdc-radio-button .mdc-label {
      color: #202124;
    }
    ::ng-deep .mat-mdc-checkbox .mdc-label {
      color: #202124;
    }
  `],
  template: `
  <form (ngSubmit)="submit()" #f="ngForm">
    <div class="form-container">
      <div *ngFor="let q of sortedInputs" class="question-card" [class.error-state]="isInvalid(q)">
        
        <div class="question-title">
          {{ q.label }} <span *ngIf="q.required" class="required-star">*</span>
        </div>

        <!-- TEXT -->
        <mat-form-field *ngIf="q.type==='TEXT'" appearance="outline" style="width:100%;" subscriptSizing="dynamic">
          <input matInput [(ngModel)]="textValues[q.orderIndex]" [name]="'q'+q.orderIndex" [required]="q.required" placeholder="Your answer">
        </mat-form-field>

        <!-- RADIO -->
        <div *ngIf="q.type==='RADIO'">
          <mat-radio-group [(ngModel)]="radioValues[q.orderIndex]" [name]="'q'+q.orderIndex" [required]="q.required" style="display:flex; flex-direction:column; gap:12px;">
            <mat-radio-button *ngFor="let opt of q.options" [value]="opt" color="primary">{{ opt }}</mat-radio-button>
          </mat-radio-group>
        </div>

        <!-- CHECKBOX -->
        <div *ngIf="q.type==='CHECKBOX'">
           <div *ngFor="let opt of q.options" style="margin-bottom:12px;">
             <mat-checkbox (change)="onCheckboxChange(q, $event)" [value]="opt" color="primary">
               {{ opt }}
             </mat-checkbox>
           </div>
        </div>

        <!-- DROPDOWN -->
        <mat-form-field *ngIf="q.type==='DROPDOWN'" appearance="outline" style="width:100%; max-width: 300px;" subscriptSizing="dynamic">
          <mat-label>Choose</mat-label>
          <mat-select [(ngModel)]="dropdownValues[q.orderIndex]" [name]="'q'+q.orderIndex" [required]="q.required">
            <mat-option *ngFor="let opt of q.options" [value]="opt">{{ opt }}</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- FILE -->
        <div *ngIf="q.type==='FILE'">
           <button type="button" mat-stroked-button (click)="fileInput.click()" color="primary">
             <mat-icon>cloud_upload</mat-icon>&nbsp;Add File
           </button>
           <input #fileInput type="file" (change)="onFileChange(q, $event)" style="display:none">
           <div *ngIf="files[q.orderIndex]" style="margin-top:12px; display:flex; align-items:center; gap:8px;">
             <mat-icon style="color:#5f6368">description</mat-icon>
             <span>{{ files[q.orderIndex].name }}</span>
             <button mat-icon-button (click)="removeFile(q.orderIndex)" type="button"><mat-icon>close</mat-icon></button>
           </div>
        </div>

        <!-- Validation Error Message -->
        <div *ngIf="isInvalid(q)" class="error-text" [@fadeIn]>
          <mat-icon style="font-size:18px; width:18px; height:18px;">error_outline</mat-icon> 
          <span>This is a required question</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <button mat-raised-button color="primary" type="submit" style="padding: 0 24px;">Submit</button>
      <button mat-button type="button" color="primary" (click)="reset()">Clear form</button>
    </div>
  </form>
  `,
  animations: [] // Could add fade in for errors
})
export class DynamicFormComponent implements OnChanges {
  @Input() survey!: Survey;
  @Output() submitted = new EventEmitter<FormData>();
  @ViewChild('f') form!: NgForm;

  sortedInputs: SurveyInput[] = [];

  textValues: Record<number, string> = {};
  radioValues: Record<number, string> = {};
  dropdownValues: Record<number, string> = {};
  checkboxValues: Record<number, Set<string>> = {};
  files: Record<number, File> = {};

  isSubmitted = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['survey'] && this.survey) {
      this.sortedInputs = [...(this.survey.inputs ?? [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }
  }

  onCheckboxChange(q: SurveyInput, evt: any) {
    const target = evt.source?.value ?? evt.target?.value;
    const checked = evt.checked ?? evt.target?.checked;
    const set = this.checkboxValues[q.orderIndex] ?? new Set<string>();
    if (checked) set.add(target); else set.delete(target);
    this.checkboxValues[q.orderIndex] = set;
  }

  onFileChange(q: SurveyInput, evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (file) this.files[q.orderIndex] = file;
  }

  removeFile(orderIndex: number) {
    delete this.files[orderIndex];
  }

  reset() {
    this.textValues = {};
    this.radioValues = {};
    this.dropdownValues = {};
    this.checkboxValues = {};
    this.files = {};
    this.isSubmitted = false;
    this.form.resetForm();
  }

  isInvalid(q: SurveyInput): boolean {
    if (!this.isSubmitted) return false;
    if (!q.required) return false;

    // Check value based on type
    switch (q.type) {
      case 'TEXT': return !this.textValues[q.orderIndex];
      case 'RADIO': return !this.radioValues[q.orderIndex];
      case 'DROPDOWN': return !this.dropdownValues[q.orderIndex];
      case 'CHECKBOX': {
        const set = this.checkboxValues[q.orderIndex];
        return !set || set.size === 0;
      }
      case 'FILE': return !this.files[q.orderIndex];
      default: return false;
    }
  }

  submit() {
    this.isSubmitted = true;

    // Check validity of all required fields
    const invalid = this.sortedInputs.some(q => this.isInvalid(q));
    if (invalid) {
      // Scroll to first error?
      return;
    }

    const fd = new FormData();
    fd.append('surveyId', String(this.survey.id ?? ''));
    this.sortedInputs.forEach(q => {
      const key = `q_${q.orderIndex}`;
      switch (q.type) {
        case 'TEXT':
          fd.append(key, this.textValues[q.orderIndex] ?? '');
          break;
        case 'RADIO':
          fd.append(key, this.radioValues[q.orderIndex] ?? '');
          break;
        case 'DROPDOWN':
          fd.append(key, this.dropdownValues[q.orderIndex] ?? '');
          break;
        case 'CHECKBOX':
          Array.from(this.checkboxValues[q.orderIndex] ?? []).forEach(v => fd.append(key, v));
          break;
        case 'FILE':
          if (this.files[q.orderIndex]) fd.append(key, this.files[q.orderIndex]);
          break;
      }
    });
    this.submitted.emit(fd);
  }
}
