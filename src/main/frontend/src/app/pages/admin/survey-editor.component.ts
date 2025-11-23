// src/app/pages/admin/survey-editor.component.ts
import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { trigger, transition, style, animate } from "@angular/animations";

import { CdkDrag, CdkDropList, CdkDragDrop, moveItemInArray, copyArrayItem } from "@angular/cdk/drag-drop";

import { MatCardModule } from "@angular/material/card";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDividerModule } from "@angular/material/divider";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { SurveyApiService } from "../../services/survey-api.service";
import { InputType, Survey, SurveyInput } from "../../models/api-model";

type PaletteItem = { label: string; type: InputType; icon: string };

@Component({
  standalone: true,
  imports: [
    NgFor, NgIf, FormsModule,
    CdkDrag, CdkDropList,
    MatCardModule, MatToolbarModule, MatListModule, MatIconModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatSnackBarModule, MatTooltipModule, MatDividerModule, MatSlideToggleModule
  ],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(8px)" }),
        animate("200ms ease-out", style({ opacity: 1, transform: "none" })),
      ]),
    ]),
  ],
  styles: [`
    .editor-container {
      max-width: 770px;
      margin: 0 auto;
      padding-bottom: 100px;
      position: relative;
    }
    .top-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: white;
      border-bottom: 1px solid #dadce0;
      padding: 12px 0;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .survey-title-card {
      border-top: 8px solid #673ab7;
      border-radius: 8px;
      margin-bottom: 12px;
      background: white;
      border: 1px solid #dadce0;
      border-top-width: 8px;
      border-top-color: #673ab7;
    }
    .question-list {
      min-height: 60px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .question-card {
      background: white;
      border: 1px solid #dadce0;
      border-radius: 8px;
      position: relative;
      transition: box-shadow 0.2s;
    }
    .question-card:hover {
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
    }
    .question-card.cdk-drag-placeholder {
      opacity: 0;
    }
    .question-card.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .question-content {
      padding: 24px;
    }
    .question-footer {
      border-top: 1px solid #dadce0;
      padding: 12px 24px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
    }
    .drag-handle {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      display: flex;
      justify-content: center;
      cursor: move;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .question-card:hover .drag-handle {
      opacity: 1;
    }
    
    /* Floating Sidebar */
    .floating-sidebar {
      position: fixed;
      right: 24px;
      top: 100px;
      width: 50px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;
      z-index: 90;
    }
    .sidebar-item {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer; /* Changed from grab to pointer for click action */
      border-radius: 50%;
      margin: 4px 0;
      color: #5f6368;
      transition: background 0.2s;
    }
    .sidebar-item:hover {
      background: #f5f5f5;
      color: #202124;
    }
    
    .cdk-drop-list-dragging .question-card {
      box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12);
    }
  `],
  template: `
    <div class="editor-container" [@fadeIn]>
      
      <!-- Top Actions Bar -->
      <div class="top-bar">
        <div style="font-size: 18px; font-weight: 500; color: #202124;">
          {{ survey().id ? "Edit Survey" : "New Survey" }}
        </div>
        <div>
          <button mat-raised-button color="primary" (click)="save()">
            Save
          </button>
          <button mat-button (click)="cancel()" style="margin-left: 8px;">
            Cancel
          </button>
        </div>
      </div>

      <!-- Title Card -->
      <div class="survey-title-card">
        <div style="padding: 24px;">
          <mat-form-field appearance="outline" style="width: 100%; font-size: 24px;">
            <input matInput [(ngModel)]="survey().title" placeholder="Form Title" style="font-size: 24px; padding: 8px 0;">
          </mat-form-field>
          <mat-form-field appearance="outline" style="width: 100%;">
            <input matInput placeholder="Form Description (optional)">
          </mat-form-field>
        </div>
      </div>

      <!-- Questions List (Drop Zone) -->
      <div
        cdkDropList
        #canvasList="cdkDropList"
        [cdkDropListData]="survey().inputs"
        (cdkDropListDropped)="drop($event)"
        class="question-list"
      >
        <div *ngFor="let q of survey().inputs; let idx = index" cdkDrag class="question-card">
          
          <!-- Drag Handle -->
          <div class="drag-handle" cdkDragHandle>
            <mat-icon style="color: #dadce0; transform: rotate(90deg);">drag_indicator</mat-icon>
          </div>

          <div class="question-content">
            <div style="display: flex; gap: 16px; align-items: start;">
              <mat-form-field appearance="outline" style="flex: 1;">
                <mat-label>Question</mat-label>
                <input matInput [(ngModel)]="q.label">
              </mat-form-field>

              <mat-form-field appearance="outline" style="width: 200px;">
                <mat-select [(ngModel)]="q.type">
                  <mat-select-trigger>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <mat-icon>{{ getIcon(q.type) }}</mat-icon>
                      <span>{{ getLabelForType(q.type) }}</span>
                    </div>
                  </mat-select-trigger>
                  <mat-option *ngFor="let p of palette" [value]="p.type">
                    <mat-icon>{{ p.icon }}</mat-icon> {{ p.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Options for Choice Types -->
            <div *ngIf="['RADIO', 'CHECKBOX', 'DROPDOWN'].includes(q.type)" style="margin-top: 8px;">
              <div *ngFor="let opt of q.options; let optIdx = index; trackBy: trackByFn" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px; color: #dadce0;">
                  {{ q.type === 'RADIO' ? 'radio_button_unchecked' : (q.type === 'CHECKBOX' ? 'check_box_outline_blank' : 'arrow_right') }}
                </mat-icon>
                <mat-form-field appearance="outline" style="flex: 1;" density="compact">
                  <input matInput [ngModel]="opt" (ngModelChange)="updateOption(q, optIdx, $event)">
                </mat-form-field>
                <button mat-icon-button (click)="removeOption(q, optIdx)" matTooltip="Remove option">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px; color: transparent;">radio_button_unchecked</mat-icon>
                <button mat-button color="primary" (click)="addOption(q)">Add option</button>
              </div>
            </div>
          </div>

          <div class="question-footer">
            <button mat-icon-button (click)="duplicate(idx)" matTooltip="Duplicate">
              <mat-icon>content_copy</mat-icon>
            </button>
            <button mat-icon-button (click)="remove(idx)" matTooltip="Delete">
              <mat-icon>delete</mat-icon>
            </button>
            <mat-divider [vertical]="true" style="height: 24px; margin: 0 8px;"></mat-divider>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>Required</span>
              <mat-slide-toggle [(ngModel)]="q.required" color="primary"></mat-slide-toggle>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Sidebar (Palette) -->
      <div class="floating-sidebar">
        <div *ngFor="let p of palette" 
             class="sidebar-item" 
             (click)="addQuestion(p.type)"
             [matTooltip]="'Add ' + p.label">
          <mat-icon>{{ p.icon }}</mat-icon>
        </div>
      </div>

    </div>
  `
})
export class SurveyEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(SurveyApiService);
  private snack = inject(MatSnackBar);

  palette: PaletteItem[] = [
    { label: "Short answer", type: "TEXT", icon: "short_text" },
    { label: "Paragraph", type: "TEXT", icon: "subject" }, // Mapping both to TEXT for now, could differentiate later
    { label: "Multiple choice", type: "RADIO", icon: "radio_button_checked" },
    { label: "Checkboxes", type: "CHECKBOX", icon: "check_box" },
    { label: "Dropdown", type: "DROPDOWN", icon: "arrow_drop_down_circle" },
    { label: "File upload", type: "FILE", icon: "cloud_upload" },
  ];

  private _survey = signal<Survey>({ title: "Untitled form", inputs: [] });
  survey = computed(() => this._survey());

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) this.svc.getSurvey(id).subscribe((s) => this._survey.set(s));
    else {
      // Add one default question for new surveys
      this.addQuestion('RADIO');
    }
  }

  drop(event: CdkDragDrop<SurveyInput[]>) {
    const inputs = [...(this._survey().inputs ?? [])];
    moveItemInArray(inputs, event.previousIndex, event.currentIndex);
    this.updateOrder(inputs);
    this._survey.set({ ...this._survey(), inputs });
  }

  addQuestion(type: InputType) {
    const s = this._survey();
    const inputs = [...(s.inputs ?? [])];
    inputs.push({
      label: "",
      type: type,
      required: false,
      orderIndex: inputs.length + 1,
      options: ['Option 1']
    });
    this._survey.set({ ...s, inputs });
  }

  duplicate(idx: number) {
    const s = this._survey();
    const inputs = [...(s.inputs ?? [])];
    const original = inputs[idx];
    const copy = { ...original, orderIndex: inputs.length + 1, options: [...(original.options || [])] };
    inputs.splice(idx + 1, 0, copy);
    this.updateOrder(inputs);
    this._survey.set({ ...s, inputs });
  }

  remove(idx: number) {
    const s = this._survey();
    const inputs = [...(s.inputs ?? [])];
    inputs.splice(idx, 1);
    this.updateOrder(inputs);
    this._survey.set({ ...s, inputs });
  }

  updateOrder(inputs: SurveyInput[]) {
    inputs.forEach((q, i) => (q.orderIndex = i + 1));
  }

  // Option management
  addOption(q: SurveyInput) {
    if (!q.options) q.options = [];
    q.options.push(`Option ${q.options.length + 1}`);
  }

  removeOption(q: SurveyInput, idx: number) {
    q.options?.splice(idx, 1);
  }

  updateOption(q: SurveyInput, idx: number, val: string) {
    if (q.options) q.options[idx] = val;
  }

  trackByFn(index: number, item: any) {
    return index;
  }

  getIcon(type: InputType): string {
    return this.palette.find(p => p.type === type)?.icon || 'help_outline';
  }

  getLabelForType(type: InputType): string {
    return this.palette.find(p => p.type === type)?.label || type;
  }

  save() {
    const s = this._survey();
    const normalized: Survey = {
      ...s,
      inputs: [...(s.inputs ?? [])].map(i => ({
        ...i,
        // Ensure options are clean
        options: i.options?.filter(o => o.trim().length > 0)
      }))
    };

    const req$ = s.id
      ? this.svc.updateSurvey(s.id, normalized)
      : this.svc.createSurvey(normalized);

    req$.subscribe({
      next: () => {
        this.snack.open("Saved successfully", "Close", { duration: 2000 });
        this.router.navigate(["/admin"]);
      },
      error: () => this.snack.open("Save failed", "Close", { duration: 2500 }),
    });
  }

  cancel() {
    this.router.navigate(["/admin"]);
  }
}
