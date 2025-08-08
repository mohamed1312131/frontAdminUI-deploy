import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import {
  ProductCategory,
  ProductService,
  ProductDetailsDTO,
  ProductVariantUploadDTO
} from '../service/ProductService';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  productForm!: FormGroup;
  coreInfo!: FormGroup;
  pricing!: FormGroup;
  variants!: FormArray;

  allCategories: ProductCategory[] = [];

  imageFiles: File[][] = [];
  previewUrls: string[][] = [];
  isDragging: boolean[] = [];
  uploadProgress: number[][] = [];

  // Size guide image handling
  sizeGuideFile: File | null = null;
  sizeGuidePreviewUrl: string | null = null;

  submitting = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.coreInfo = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      additionalInfo: [''],
      sizeGuide: ['']
    });

    this.pricing = this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]],
      oldPrice: [null, Validators.min(0)]
    });

    this.variants = this.fb.array([]);
    this.productForm = this.fb.group({
      coreInfo: this.coreInfo,
      variants: this.variants,
      pricing: this.pricing
    });

    this.productService.getCategories().subscribe(res => {
      this.allCategories = res;
    });
  }

  get sizes(): (i: number) => FormArray {
    return (i: number) => this.variants.at(i).get('sizes') as FormArray;
  }

  addNewVariant(): void {
    const variant = this.fb.group({
      color: ['', Validators.required],
      sizes: this.fb.array([], Validators.required)
    });
    this.variants.push(variant);
    this.imageFiles.push([]);
    this.previewUrls.push([]);
    this.isDragging.push(false);
    this.uploadProgress.push([]);
  }

  removeVariant(i: number): void {
    this.previewUrls[i].forEach(u => URL.revokeObjectURL(u));
    this.variants.removeAt(i);
    this.imageFiles.splice(i, 1);
    this.previewUrls.splice(i, 1);
    this.isDragging.splice(i, 1);
    this.uploadProgress.splice(i, 1);
  }

  addSize(i: number): void {
    this.sizes(i).push(
      this.fb.group({
        size: ['', Validators.required],
        stock: [1, [Validators.required, Validators.min(1)]]
      })
    );
  }

  removeSize(vi: number, si: number): void {
    this.sizes(vi).removeAt(si);
  }

  onDrop(ev: DragEvent, i: number): void {
    ev.preventDefault();
    this.isDragging[i] = false;
    if (ev.dataTransfer?.files) this.addImages(Array.from(ev.dataTransfer.files), i);
  }

  onDragOver(ev: DragEvent, i: number): void {
    ev.preventDefault();
    this.isDragging[i] = true;
  }

  onDragLeave(ev: DragEvent, i: number): void {
    this.isDragging[i] = false;
  }

  onImageSelect(e: any, i: number): void {
    if (e.target.files) this.addImages(Array.from(e.target.files), i);
  }

  private addImages(files: File[], i: number): void {
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      this.imageFiles[i].push(f);
      this.previewUrls[i].push(url);
      this.uploadProgress[i].push(0);
    });
  }

  removeImage(vi: number, idx: number): void {
    URL.revokeObjectURL(this.previewUrls[vi][idx]);
    this.imageFiles[vi].splice(idx, 1);
    this.previewUrls[vi].splice(idx, 1);
    this.uploadProgress[vi].splice(idx, 1);
  }

  dropImage(vi: number, e: CdkDragDrop<string[]>): void {
    moveItemInArray(this.previewUrls[vi], e.previousIndex, e.currentIndex);
    moveItemInArray(this.imageFiles[vi], e.previousIndex, e.currentIndex);
    moveItemInArray(this.uploadProgress[vi], e.previousIndex, e.currentIndex);
  }

  // In your add-product.component.ts, replace the onSubmit method:

async onSubmit(): Promise<void> {
  if (this.productForm.invalid) return;
  this.submitting = true;

  const core = this.coreInfo.getRawValue();
  const pricing = this.pricing.getRawValue();

  const dto: ProductDetailsDTO = {
    title: core.title,
    description: core.description,
    categoryId: core.categoryId,
    price: pricing.price,
    oldPrice: pricing.oldPrice,
    additionalInfo: core.additionalInfo,
    sizeGuide: core.sizeGuide
  };

  try {
    const prod = await this.productService.createProduct(dto).toPromise();
    const pid = prod.id;
    
    // ✅ FIXED: Upload size guide image using the correct endpoint
    if (this.sizeGuideFile) {
      const formData = new FormData();
      formData.append('productData', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
      formData.append('sizeGuideImage', this.sizeGuideFile);
      
      // Use the existing updateProduct endpoint instead of the non-existent updateProductWithSizeGuide
      await this.productService.updateProduct(pid, formData).toPromise();
    }
    
    // Upload variants
    for (let i = 0; i < this.variants.length; i++) {
      const vg = this.variants.at(i);
      const vdto: ProductVariantUploadDTO = {
        color: vg.get('color')!.value,
        sizes: this.sizes(i).value
      };
      const imgs = this.imageFiles[i];
      if (imgs.length) {
        await this.productService.uploadVariant(pid, vdto, imgs).toPromise();
      }
    }
    
    this.snackBar.open('Product created successfully!', 'Close', { duration: 3000 });
    this.resetForm();
  } catch (e) {
  console.error('Upload error:', e);
  let errorMsg = 'Unknown error';
  if (typeof e === 'object' && e !== null) {
    // If e has an 'error' property with a 'message'
    if ('error' in e && typeof (e as any).error?.message === 'string') {
      errorMsg = (e as any).error.message;
    } else if ('message' in e && typeof (e as any).message === 'string') {
      errorMsg = (e as any).message;
    }
  }
  this.snackBar.open('Upload error: ' + errorMsg, 'Close', { duration: 3000 });
} finally {
    this.submitting = false;
  }
}

  private resetForm(): void {
    this.productForm.reset();
    this.variants.clear();
    this.previewUrls.flat().forEach(u => URL.revokeObjectURL(u));
    this.imageFiles = [];
    this.previewUrls = [];
    this.uploadProgress = [];
    this.stepper.reset();
  }

  getProductTotalStock(): number {
    return this.variants.controls.reduce(
      (sum, _, i) =>
        sum + this.sizes(i).controls.reduce((s, ctrl) => s + (ctrl.get('stock')!.value || 0), 0),
      0
    );
  }

  getColorTotalStock(i: number): number {
    return this.sizes(i).controls.reduce((s, ctrl) => s + (ctrl.get('stock')!.value || 0), 0);
  }

  get variantsLength(): number {
    return this.variants.length;
  }

  // Size guide image handling methods
  onSizeGuideFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.sizeGuideFile = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.sizeGuidePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSizeGuideImage(): void {
    this.sizeGuideFile = null;
    this.sizeGuidePreviewUrl = null;
    this.coreInfo.patchValue({ sizeGuide: '' });
  }
}
