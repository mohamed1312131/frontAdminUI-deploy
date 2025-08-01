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
      sizeGuide: [''], // ✅ ADD THIS LINE
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
  variantFormGroup.get('variantId')?.setValue(null);  // 🧼 Ensure null
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

async onSave(): Promise<void> {
  if (this.productForm.invalid) {
    this.snackBar.open('Form is invalid. Please check all fields.', 'Close', { duration: 3000 });
    return;
  }

  this.isLoading = true;

  try {
    // Prepare the full product update payload
    const productUpdatePayload = {
      ...this.productForm.value,
      variantsToDelete: this.removedVariantIds // ✅ add this
    };

    // Update core product details and handle deleted variants
    await this.productSvc.updateProduct(this.product.id, productUpdatePayload).toPromise();

    // Handle variant updates and new additions
    for (let i = 0; i < this.variants.length; i++) {
      const variantFormGroup = this.variants.at(i);
      const variantId = variantFormGroup.get('variantId')?.value;

      if (!variantId) {
        const tempKey = `new-${i}`;
        const uploadPayload = {
          color: variantFormGroup.get('color')?.value,
          sizes: variantFormGroup.get('sizes')?.value
        };

        const createdVariant = await this.productSvc.uploadVariant(
          this.product.id,
          uploadPayload,
          this.newImagesMap.get(tempKey) || []
        ).toPromise();

        variantFormGroup.get('variantId')?.setValue(createdVariant.id);
        this.newImagesMap.set(createdVariant.id, this.newImagesMap.get(tempKey) || []);
        this.newImagesMap.delete(tempKey);
      } else {
        await this.productSvc.updateVariant(
          this.product.id,
          variantFormGroup.value,
          this.newImagesMap.get(variantId) || []
        ).toPromise();
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
