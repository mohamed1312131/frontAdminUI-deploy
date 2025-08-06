import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductDetails } from '../product-details/product-details.component';

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductDetailsDTO {
  title: string;
  description: string;
  categoryId?: string;
  newCategoryName?: string;
  price: number;
  oldPrice?: number;
  additionalInfo?: string;
  sizeGuide?: string;
  
}

export interface SizeVariant {
  size: string;
  stock: number;
}

// for creating new variants
export interface ProductVariantUploadDTO {
  color: string;
  sizes: SizeVariant[];
}

// for updating existing variants
export interface ProductVariantUpdateDTO {
  variantId: string;
  color: string;
  sizes: SizeVariant[];
  imagesToRemove?: string[];
}

export interface ProductListDTO {
  id: string;
  title: string;
  thumbnail: string;
  sizes: string[];
  price: number;
  stockLeft: number;
  sold: number;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  // --- existing methods ---

  createProduct(data: ProductDetailsDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

uploadVariant(productId: string, variant: ProductVariantUploadDTO, images: File[]): Observable<any> {
  const formData = new FormData();
  formData.append('variant', new Blob([JSON.stringify(variant)], { type: 'application/json' }));

  if (images && images.length > 0) {
    images.forEach(img => formData.append('images', img));
  }

  return this.http.post(`${this.apiUrl}/${productId}/variant`, formData);
}

getCategories(): Observable<ProductCategory[]> {
  return this.http.get<ProductCategory[]>(`${environment.apiUrl}/categories/active`);
}

  getProducts(): Observable<ProductListDTO[]> {
    return this.http.get<ProductListDTO[]>(this.apiUrl);
  }

  getProductDetails(id: string): Observable<ProductDetails> {
    return this.http.get<ProductDetails>(`${this.apiUrl}/${id}`);
  }

  // --- new methods ---

  /** Update core product fields */
updateProduct(id: string, formData: FormData): Observable<ProductDetails> {
    return this.http.put<ProductDetails>(
      `${this.apiUrl}/${id}`,
      formData
      // Note: No 'Content-Type' header is set here. Angular's HttpClient
      // will automatically set it to 'multipart/form-data' with the correct boundary.
    );
  }

  /** Update product with size guide image */
  updateProductWithSizeGuide(id: string, formData: FormData): Observable<ProductDetails> {
    return this.http.put<ProductDetails>(
      `${this.apiUrl}/${id}/with-size-guide`,
      formData
    );
  }

  /**
   * Update an existing variant:
   *  - removes any URLs in imagesToRemove
   *  - uploads newImages if provided
   *  - updates color & sizes
   */
 updateVariant(productId: string, variant: any, newImages: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('variant', new Blob([JSON.stringify(variant)], { type: 'application/json' }));
    newImages.forEach(file => formData.append('newImages', file));
    return this.http.put(`${this.apiUrl}/${productId}/variant/${variant.variantId}`, formData);
  }
  deleteVariant(productId: string, variantId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${productId}/variant/${variantId}`);
}
deleteProduct(productId: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${productId}`);
}
}
