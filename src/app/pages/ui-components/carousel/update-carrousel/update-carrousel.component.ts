import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Carousel, CarouselService } from '../../service/carrouselService';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-update-carrousel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './update-carrousel.component.html',
  styleUrl: './update-carrousel.component.scss'
})
export class UpdateCarrouselComponent {
  form: FormGroup;
  imagePreview: string = '';
  imageRemoved = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateCarrouselComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Carousel,
    private carouselService: CarouselService
  ) {
    this.imagePreview = data.imageUrl;

    const imageRequired = !this.imagePreview;

    this.form = this.fb.group({
      title: [data.title, Validators.required],
      description: [data.description, Validators.required],
      status: [data.status],
      image: [null, imageRequired ? Validators.required : []]
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ image: file });
      this.imageRemoved = false;

      // Remove validator since image is now provided
      this.form.get('image')?.clearValidators();
      this.form.get('image')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = '';
    this.imageRemoved = true;
    this.form.patchValue({ image: null });

    // Re-add required validator if user removes image
    this.form.get('image')?.setValidators(Validators.required);
    this.form.get('image')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formData = new FormData();
    formData.append('title', this.form.value.title);
    formData.append('description', this.form.value.description);
    formData.append('status', this.form.value.status);

    if (!this.imageRemoved && !this.form.value.image) {
      // keep existing image
    } else if (this.form.value.image) {
      formData.append('image', this.form.value.image);
    } else if (this.imageRemoved) {
      formData.append('imageRemoved', 'true');
    }

    this.carouselService.update(this.data.id, formData).subscribe(() => {
      this.dialogRef.close(true);
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
