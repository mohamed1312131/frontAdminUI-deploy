import { Component, Inject, OnInit, inject } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-update-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './update-category.component.html',
  styleUrls: ['./update-category.component.scss']
})
export class UpdateCategoryComponent implements OnInit {
  form!: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  dialogRef = inject(MatDialogRef<UpdateCategoryComponent>);
  data = inject(MAT_DIALOG_DATA); // expects: { id, name, imageUrl }
  http = inject(HttpClient);
  fb = inject(FormBuilder);

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.name, Validators.required],
      image: [null] // optional, handled manually
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

  isImageMissing(): boolean {
    return !this.imageFile && !this.imagePreview;
  }

  submit(): void {
    if (this.form.invalid || this.isImageMissing()) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('name', this.form.value.name);

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    } else if (!this.imagePreview) {
      formData.append('image', ''); // optional: backend handles blank or null
    }

    this.http.post(`${environment.apiUrl}/categories/${this.data.id}`, formData).subscribe({
      next: updated => this.dialogRef.close(updated),
      error: err => console.error('Failed to update category', err)
    });
  }
}
