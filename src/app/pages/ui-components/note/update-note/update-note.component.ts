import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-update-note',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './update-note.component.html',
  styleUrls: ['./update-note.component.scss']
})
export class UpdateNoteComponent implements OnInit {
  form!: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  dialogRef = inject(MatDialogRef<UpdateNoteComponent>);
  data = inject(MAT_DIALOG_DATA); // expects note data: { id, title, description, imageUrl }
  http = inject(HttpClient);
  fb = inject(FormBuilder);

  ngOnInit(): void {
  this.form = this.fb.group({
    title: [this.data.title, Validators.required],
    description: [this.data.description, Validators.required],
    image: [null] // image is handled separately
  });

  this.imagePreview = this.data.imageUrl || null;
}


  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      this.form.patchValue({ image: this.imageFile });

      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(this.imageFile);
    }
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
    this.form.patchValue({ image: null });
  }

  submit(): void {
  if (this.form.invalid || this.isImageMissing()) {
    this.form.markAllAsTouched();
    return;
  }

  const formData = new FormData();
  formData.append('title', this.form.value.title);
  formData.append('description', this.form.value.description);

  if (this.imageFile) {
    formData.append('image', this.imageFile);
  } else if (!this.imagePreview) {
    formData.append('image', ''); // signal removal (though not possible here if required)
  }

  this.http.post(`${environment.apiUrl}/notes/${this.data.id}`, formData).subscribe({
    next: updatedNote => this.dialogRef.close(updatedNote),
    error: err => console.error('Update failed', err)
  });
}
isImageMissing(): boolean {
  return !this.imageFile && !this.imagePreview;
}
}
