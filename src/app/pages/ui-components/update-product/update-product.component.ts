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
  
  // Properties for size guide management
  sizeGuideFile: File | null = null;
  sizeGuidePreview: string | null = null;

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
      oldPrice: [0],
      additionalInfo: [''],
      categoryId: ['', Validators.required],
      newCategoryName: [''],
      // Form control for the size guide URL or null
      sizeGuide: [null], 
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
      oldPrice: data.oldPrice,
      additionalInfo: data.additionalInfo,
      // Patch the existing size guide URL into the form
      sizeGuide: data.sizeGuide,
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

  // --- New methods for handling the size guide image ---

  onSizeGuideSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.sizeGuideFile = file;
      this.sizeGuidePreview = URL.createObjectURL(file); // Create a temporary URL for preview
      this.productForm.get('sizeGuide')?.markAsDirty();
    }
  }

  clearSizeGuide(): void {
      this.sizeGuideFile = null;
      this.sizeGuidePreview = null;
      // Set the form control value to null to signal deletion on the backend
      this.productForm.get('sizeGuide')?.setValue(null);
      this.productForm.get('sizeGuide')?.markAsDirty();
  }
  
  // --- Main Save Logic ---

  async onSave(): Promise<void> {
    if (this.productForm.invalid) {
      this.snackBar.open('Form is invalid. Please check all fields.', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    try {
        // Use FormData to be able to send the product data and the image file together
        const formData = new FormData();

        // 1. Prepare the product data payload (excluding variants for this first call)
        const productUpdatePayload = {
            title: this.productForm.get('title')?.value,
            description: this.productForm.get('description')?.value,
            price: this.productForm.get('price')?.value,
            oldPrice: this.productForm.get('oldPrice')?.value,
            additionalInfo: this.productForm.get('additionalInfo')?.value,
            categoryId: this.productForm.get('categoryId')?.value,
            sizeGuide: this.productForm.get('sizeGuide')?.value,
            variantsToDelete: this.removedVariantIds
        };
        
        // 2. Append product data as a JSON Blob. The backend will parse this string.
        formData.append('productData', new Blob([JSON.stringify(productUpdatePayload)], {
            type: 'application/json'
        }));

        // 3. Append the new size guide image file, if one was selected
        if (this.sizeGuideFile) {
            formData.append('sizeGuideImage', this.sizeGuideFile, this.sizeGuideFile.name);
        }

        // 4. Call the service to update the core product details and size guide
        await this.productSvc.updateProduct(this.product.id, formData).toPromise();

        // 5. Sequentially handle variant updates and new additions
        for (let i = 0; i < this.variants.length; i++) {
            const variantFormGroup = this.variants.at(i);
            const variantId = variantFormGroup.get('variantId')?.value;

            if (!variantId) { // This is a new variant
                const tempKey = `new-${i}`;
                const uploadPayload = {
                    color: variantFormGroup.get('color')?.value,
                    sizes: variantFormGroup.get('sizes')?.value
                };
                await this.productSvc.uploadVariant(
                    this.product.id,
                    uploadPayload,
                    this.newImagesMap.get(tempKey) || []
                ).toPromise();

            } else { // This is an existing variant
                await this.productSvc.updateVariant(
                    this.product.id,
                    variantFormGroup.value,
                    this.newImagesMap.get(variantId) || []
                ).toPromise();
            }
        }

        this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(true); // Close dialog and signal success
    } catch (error) {
        console.error('Failed to update product', error);
        this.snackBar.open('An error occurred during the update. Please try again.', 'Close', { duration: 4000 });
    } finally {
        this.isLoading = false;
    }
  }

  private getCurrentCategoryName(): string {
    // This seems like placeholder logic, but keeping it as is from the original code.
    // In a real scenario, you might get this from this.product.category.name or similar.
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
    this.newImagesMap.delete(variantId); // Also clean up any staged images for the deleted variant
    this.variants.removeAt(index);
  }
}