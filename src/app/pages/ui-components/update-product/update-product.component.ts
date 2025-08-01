// /src/app/components/update-product/update-product.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductDetails } from '../product-details/product-details.component';
import { ProductCategory, ProductService } from '../service/ProductService';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.scss']
})
export class UpdateProductComponent implements OnInit {
  productForm: FormGroup;
  allCategories: ProductCategory[] = [];
  isLoading = false;
  newImagesMap = new Map<string, File[]>();
  removedVariantIds: string[] = [];

  // ✨ NEW: State for the size guide file
  sizeGuideFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private productSvc: ProductService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UpdateProductComponent>,
    @Inject(MAT_DIALOG_DATA) public product: ProductDetails
  ) {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      sizeGuide: [''], // This control will hold the URL for display
      oldPrice: [0],
      additionalInfo: [''],
      categoryId: ['', Validators.required],
      newCategoryName: [''],
      variants: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.allCategories = this.product.allCategories;
    this.initializeForm(this.product);
  }

  initializeForm(data: ProductDetails): void {
    this.productForm.patchValue({
      title: data.title,
      description: data.description,
      price: data.price,
      sizeGuide: data.sizeGuide,
      oldPrice: data.oldPrice,
      additionalInfo: data.additionalInfo,
      categoryId: data.allCategories.find(c => c.name === this.getCurrentCategoryName())?.id || ''
    });

    const variantControls = data.variants.map(variant =>
      this.fb.group({
        variantId: [variant.variantId],
        color: [variant.color, Validators.required],
        images: [variant.images],
        imagesToRemove: [[]],
        sizes: this.fb.array(
          variant.sizes.map(size =>
            this.fb.group({
              size: [size.size, Validators.required],
              stock: [size.stock, [Validators.required, Validators.min(0)]]
            })
          )
        )
      })
    );
    this.productForm.setControl('variants', this.fb.array(variantControls));
  }
  
  // ✨ NEW: Handle size guide file selection
  onSizeGuideSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.sizeGuideFile = input.files[0];
      // Create a temporary URL for previewing the new image
      const previewUrl = URL.createObjectURL(this.sizeGuideFile);
      this.productForm.get('sizeGuide')?.setValue(previewUrl);
    }
  }

  // ✨ NEW: Remove the size guide
  removeSizeGuide(): void {
    this.sizeGuideFile = null;
    this.productForm.get('sizeGuide')?.setValue(null);
    // You might want to revoke the object URL if it exists to free memory
    // URL.revokeObjectURL(...)
  }
  
  // 🔧 MODIFIED: The onSave method is updated to handle file uploads
  async onSave(): Promise<void> {
    if (this.productForm.invalid) {
      this.snackBar.open('Form is invalid. Please check all fields.', 'Close', { duration: 3000 });
      return;
    }
  
    this.isLoading = true;
  
    try {
      const productUpdatePayload = {
        ...this.productForm.value,
        variantsToDelete: this.removedVariantIds
      };
  
      // ✅ LOGIC: Decide which endpoint to call based on whether a new size guide was uploaded.
      if (this.sizeGuideFile) {
        const formData = new FormData();
        // The DTO payload. 'sizeGuide' will be overwritten on the backend by the uploaded file.
        formData.append('product', new Blob([JSON.stringify(productUpdatePayload)], { type: 'application/json' }));
        formData.append('sizeGuideImage', this.sizeGuideFile);
  
        await this.productSvc.updateProductWithSizeGuide(this.product.id, formData).toPromise();
      } else {
        // No new file, just send the JSON data.
        // If the user removed the guide, `productUpdatePayload.sizeGuide` will be null, and the backend will save it.
        await this.productSvc.updateProduct(this.product.id, productUpdatePayload).toPromise();
      }
  
      // --- The rest of the variant update logic remains the same ---
      for (let i = 0; i < this.variants.length; i++) {
        const variantFormGroup = this.variants.at(i);
        const variantId = variantFormGroup.get('variantId')?.value;
  
        if (!variantId) {
          const tempKey = `new-${i}`;
          const uploadPayload = {
            color: variantFormGroup.get('color')?.value,
            sizes: variantFormGroup.get('sizes')?.value
          };
          await this.productSvc.uploadVariant(this.product.id, uploadPayload, this.newImagesMap.get(tempKey) || []).toPromise();
        } else {
          await this.productSvc.updateVariant(this.product.id, variantFormGroup.value, this.newImagesMap.get(variantId) || []).toPromise();
        }
      }
  
      this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Failed to update product', error);
      this.snackBar.open('An error occurred. Please try again.', 'Close', { duration: 4000 });
    } finally {
      this.isLoading = false;
    }
  }

  // --- Other methods (getters, add/remove variant/size, etc.) remain unchanged ---
  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  getSizes(variantIndex: number): FormArray {
    return this.variants.at(variantIndex).get('sizes') as FormArray;
  }

  addSize(variantIndex: number): void {
    const sizeGroup = this.fb.group({
      size: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
    this.getSizes(variantIndex).push(sizeGroup);
  }

  removeSize(variantIndex: number, sizeIndex: number): void {
    this.getSizes(variantIndex).removeAt(sizeIndex);
  }

  onFileSelected(event: Event, variantIndex: number): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    const variantFormGroup = this.variants.at(variantIndex) as FormGroup;
    let variantId = variantFormGroup.get('variantId')?.value;
    if (variantId === undefined || variantId === '') {
      variantId = null;
      variantFormGroup.get('variantId')?.setValue(null);
    }
    const tempKey = variantId || `new-${variantIndex}`;
    this.newImagesMap.set(tempKey, files);
    const existingImages = variantFormGroup.get('images')?.value || [];
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    variantFormGroup.get('images')?.setValue([...existingImages, ...newImageUrls]);
  }

  removeImage(variantIndex: number, imageUrl: string): void {
    const variantFormGroup = this.variants.at(variantIndex) as FormGroup;
    const imagesControl = variantFormGroup.get('images');
    const imagesToRemoveControl = variantFormGroup.get('imagesToRemove');
    if (imagesControl) {
      imagesControl.setValue(imagesControl.value.filter((img: string) => img !== imageUrl));
    }
    if (imageUrl.startsWith('http') && imagesToRemoveControl) {
      imagesToRemoveControl.value.push(imageUrl);
    }
  }

  private getCurrentCategoryName(): string {
    const variant = this.product.variants[0];
    return "t shirt";
  }

  addVariant(): void {
    const newVariantGroup = this.fb.group({
      variantId: [null],
      color: ['', Validators.required],
      images: [[]],
      imagesToRemove: [[]],
      sizes: this.fb.array([
        this.fb.group({
          size: ['', Validators.required],
          stock: [0, [Validators.required, Validators.min(0)]]
        })
      ])
    });
    this.variants.push(newVariantGroup);
  }

  removeVariant(index: number): void {
    const variantId = this.variants.at(index).get('variantId')?.value;
    if (variantId) {
      this.removedVariantIds.push(variantId);
    }
    this.newImagesMap.delete(variantId);
    this.variants.removeAt(index);
  }
}