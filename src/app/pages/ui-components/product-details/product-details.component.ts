import { Component, Inject }               from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA }   from '@angular/material/dialog';

export interface SizeVariant {
  size: string;
  stock: number;      // Current remaining stock
  sold: number;       // Total sold quantity
  totalStock: number; // Original total stock (stock + sold)
}

export interface ProductVariant {
  variantId: any;
  id?: string;
  color: string;
  images: string[];
  sizes: SizeVariant[];
}

export interface ProductDetails {
  id: string;
  title: string;
  description: string;
  allCategories: { id: string; name: string }[];
  price: number;
  oldPrice?: number;
  additionalInfo?: string;
  variants: ProductVariant[];
}

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent {
  constructor(
    private dialogRef: MatDialogRef<ProductDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductDetails
  ) {}

  close() {
    this.dialogRef.close();
  }
}
