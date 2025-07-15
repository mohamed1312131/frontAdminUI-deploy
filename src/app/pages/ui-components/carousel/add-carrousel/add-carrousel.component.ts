

import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { CarouselService } from '../../service/carrouselService';


@Component({
  selector: 'app-add-carrousel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    NgIf
  ],
  templateUrl: './add-carrousel.component.html',
  styleUrl: './add-carrousel.component.scss'
})
export class AddCarrouselComponent {
  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    image: [null as File | null, Validators.required]
  });

  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddCarrouselComponent>,
    private carouselService: CarouselService,
    private snackBar: MatSnackBar
  ) {}

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({ image: file });
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  submit(): void {
  if (this.form.invalid) return;

  const formData = new FormData();
  const title = this.form.get('title')?.value;
  const description = this.form.get('description')?.value;
  const image = this.form.get('image')?.value;

  if (title && description && image) {
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);

    this.carouselService.create(formData).subscribe(() => {
      this.snackBar.open('Carousel created successfully', 'Close', { duration: 2000 });
      this.dialogRef.close(true);
    });
  } else {
    this.snackBar.open('Form fields are invalid or incomplete', 'Close', { duration: 2000 });
  }
}

}
