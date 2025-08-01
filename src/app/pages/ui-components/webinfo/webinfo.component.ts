import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WebinfoService } from '../service/WebinfoService';

@Component({
  selector: 'app-webinfo',
  templateUrl: './webinfo.component.html',
  styleUrls: ['./webinfo.component.scss']
})
export class WebinfoComponent implements OnInit {
  webInfoForm!: FormGroup;
  logoUrl: string | null = null;
  aboutImageUrl: string | null = null;

  // New additions for multiple Instagram images
  instagramImages: File[] = [];
  instagramPreviewUrls: string[] = [];
  existingInstagramUrls: string[] = [];

  constructor(private fb: FormBuilder, private webinfoService: WebinfoService) {}

  ngOnInit(): void {
    this.webInfoForm = this.fb.group({
  instagramUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
  facebookUrl: [''],
  youtubeUrl: [''],
  pinterestUrl: [''],
  threadsUrl: [''],
  phone: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  location: ['', Validators.required],
  description: ['', Validators.required],
  aboutTitle: ['', Validators.required],
  aboutDescription: ['', Validators.required],
  aboutImage: [null],
  logo: [null]
});

    this.loadData();
  }

  loadData(): void {
    this.webinfoService.getWebsiteInfo().subscribe(data => {
      this.webInfoForm.patchValue({
  instagramUrl: data.instagramUrl,
  facebookUrl: data.facebookUrl,
  youtubeUrl: data.youtubeUrl,
  pinterestUrl: data.pinterestUrl,
  threadsUrl: data.threadsUrl,
  phone: data.phone,
  email: data.email,
  location: data.location,
  description: data.description,
  aboutTitle: data.aboutUs?.title,
  aboutDescription: data.aboutUs?.description
});

      this.logoUrl = data.logoUrl;
      this.aboutImageUrl = data.aboutUs?.imageUrl;
      this.existingInstagramUrls = data.instagramUrls || [];
    });
  }

  onFileSelected(event: Event, field: 'logo' | 'aboutImage') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const previewUrl = URL.createObjectURL(file);
      this.webInfoForm.get(field)?.setValue(file);

      if (field === 'logo') this.logoUrl = previewUrl;
      else this.aboutImageUrl = previewUrl;
    }
  }

  // Handle multiple Instagram images
  onInstagramImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.instagramImages.push(file);
        this.instagramPreviewUrls.push(URL.createObjectURL(file));
      }
    }
  }

  removeInstagramImage(index: number): void {
    this.instagramImages.splice(index, 1);
    this.instagramPreviewUrls.splice(index, 1);
  }

  removeExistingInstagramImage(index: number): void {
    this.existingInstagramUrls.splice(index, 1);
    // TODO: Optionally send DELETE request to backend if needed
  }

  removeImage(field: 'logo' | 'aboutImage') {
    this.webInfoForm.get(field)?.reset();
    if (field === 'logo') this.logoUrl = null;
    else this.aboutImageUrl = null;
  }

  onSubmit(): void {
    if (this.webInfoForm.invalid) return;

    const raw = this.webInfoForm.value;
    const formData = new FormData();

    const info = {
      instagramUrl: raw.instagramUrl,
      phone: raw.phone,
      email: raw.email,
      location: raw.location,
      description: raw.description,
      aboutUs: {
        title: raw.aboutTitle,
        description: raw.aboutDescription
      },
      // optionally send preserved existing URLs to backend
      instagramUrls: this.existingInstagramUrls
    };

    formData.append('info', new Blob([JSON.stringify(info)], { type: 'application/json' }));

    if (raw.logo) formData.append('logo', raw.logo);
    if (raw.aboutImage) formData.append('aboutImage', raw.aboutImage);

    // Append new Instagram images
    this.instagramImages.forEach(file => {
      formData.append('instagramImages', file);
    });

    this.webinfoService.submitForm(formData).subscribe({
      next: () => alert('Website Info saved successfully.'),
      error: () => alert('Failed to save website info.')
    });
  }
}
