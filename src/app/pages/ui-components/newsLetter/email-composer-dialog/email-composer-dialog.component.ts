import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-email-composer-dialog',
  templateUrl: './email-composer-dialog.component.html',
  styleUrls: ['./email-composer-dialog.component.scss']
})
export class EmailComposerDialogComponent {
  form: FormGroup;
  selectedFile?: File;
  imageUrl: string = '';
  showPreview: boolean = false;
  imageUploading: boolean = false;
  currentYear: number = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmailComposerDialogComponent>,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
  subject: ['', Validators.required],
  title: ['', Validators.required],
  subtitle: ['', Validators.required],
  body: ['', Validators.required],
  productLink: [''],
  imageUrl: [''] // ✅ add this
});
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadImageToCloudinary();
    }
  }

  private uploadImageToCloudinary(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.imageUploading = true;

    this.http.post(`${environment.apiUrl}/newsletter/upload-image`, formData, { responseType: 'text' })
  .subscribe({
    next: (url: string) => {
      this.form.patchValue({ imageUrl: url }); // ✅ store in form
      this.imageUrl = url;
      this.imageUploading = false;
    },
    error: () => {
      this.imageUploading = false;
      alert('Failed to upload image');
    }
  });

  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  onSubmit(): void {
  if (this.form.invalid) return;

  if (this.imageUploading) {
    alert('Please wait for the image to finish uploading before sending.');
    return;
  }

  const payload = {
    ...this.form.value,
    imageUrl: this.imageUrl
  };

  this.dialogRef.close(payload);
}


  close(): void {
    this.dialogRef.close();
  }
}
