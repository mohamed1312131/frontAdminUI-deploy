import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Subscription } from 'rxjs';

export type NoteButtonType = 'SHOP' | 'INQUIRY' | 'CUSTOM' | 'NONE';

export const NOTE_BUTTON_DEFAULT_TEXT: Record<NoteButtonType, string> = {
  SHOP: 'Shop Now',
  INQUIRY: 'Book an Inquiry',
  CUSTOM: 'Learn More',
  NONE: ''
};

// Mirrors the backend rule: a site path ("/shop") or an https link, nothing else.
function safeUrl(control: AbstractControl): ValidationErrors | null {
  const value = (control.value || '').trim();
  if (!value) return null;
  return /^(\/(?![/\\])\S*|https:\/\/\S+)$/.test(value) ? null : { unsafeUrl: true };
}

/** Adds the button/layout controls to a note form and appends them to the multipart payload. */
export function addNoteButtonControls(fb: FormBuilder, form: FormGroup, note?: any): void {
  form.addControl('buttonType', fb.control(note?.buttonType || 'SHOP'));
  form.addControl('buttonText', fb.control(note?.buttonText || '', Validators.maxLength(40)));
  form.addControl('buttonUrl', fb.control(note?.buttonUrl || '', [Validators.maxLength(500), safeUrl]));
  form.addControl('imagePosition', fb.control(note?.imagePosition || 'LEFT'));
}

export function appendNoteButtonFields(formData: FormData, form: FormGroup): void {
  const v = form.value;
  formData.append('buttonType', v.buttonType);
  formData.append('buttonText', v.buttonType === 'NONE' ? '' : (v.buttonText || '').trim());
  formData.append('buttonUrl', v.buttonType === 'CUSTOM' ? (v.buttonUrl || '').trim() : '');
  formData.append('imagePosition', v.imagePosition);
}

@Component({
  selector: 'app-note-button-fields',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonToggleModule],
  template: `
    <div [formGroup]="form" class="note-button-fields">
      <h3 class="section-title">Button &amp; layout</h3>

      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Button</mat-label>
        <mat-select formControlName="buttonType">
          <mat-option value="SHOP">Shop now (goes to the shop)</mat-option>
          <mat-option value="INQUIRY">Inquiry (goes to the client inquiry form)</mat-option>
          <mat-option value="CUSTOM">Custom link</mat-option>
          <mat-option value="NONE">No button</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-100" *ngIf="type !== 'NONE'">
        <mat-label>Button text</mat-label>
        <input matInput formControlName="buttonText" [placeholder]="defaultText" maxlength="40" />
        <mat-hint>Leave empty to use "{{ defaultText }}"</mat-hint>
        <mat-error *ngIf="form.get('buttonText')?.hasError('maxlength')">At most 40 characters</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-100" *ngIf="type === 'CUSTOM'">
        <mat-label>Link</mat-label>
        <input matInput formControlName="buttonUrl" placeholder="/shop?category=dresses or https://..." />
        <mat-hint>A page of the site starting with /, or a full https:// address</mat-hint>
        <mat-error *ngIf="form.get('buttonUrl')?.hasError('required')">Link is required for a custom button</mat-error>
        <mat-error *ngIf="form.get('buttonUrl')?.hasError('unsafeUrl')">Must start with / or https://</mat-error>
      </mat-form-field>

      <div class="position-row">
        <span class="position-label">Image position</span>
        <mat-button-toggle-group formControlName="imagePosition" aria-label="Image position">
          <mat-button-toggle value="LEFT">Left</mat-button-toggle>
          <mat-button-toggle value="RIGHT">Right</mat-button-toggle>
        </mat-button-toggle-group>
      </div>
    </div>
  `,
  styles: [`
    .note-button-fields { display: flex; flex-direction: column; gap: 12px; margin-bottom: 1.5rem; }
    .section-title { font-size: 1rem; font-weight: 600; margin: 0 0 4px; }
    .position-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .position-label { font-weight: 500; }
  `]
})
export class NoteButtonFieldsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;
  private sub?: Subscription;

  get type(): NoteButtonType {
    return this.form.get('buttonType')?.value;
  }

  get defaultText(): string {
    return NOTE_BUTTON_DEFAULT_TEXT[this.type] || '';
  }

  ngOnInit(): void {
    const url = this.form.get('buttonUrl')!;
    const sync = (type: NoteButtonType) => {
      url.setValidators(type === 'CUSTOM'
        ? [Validators.required, Validators.maxLength(500), safeUrl]
        : [Validators.maxLength(500), safeUrl]);
      url.updateValueAndValidity({ emitEvent: false });
    };
    sync(this.type);
    this.sub = this.form.get('buttonType')!.valueChanges.subscribe(sync);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
