import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ProductCategory {
  id: string;
  name: string;
  imageUrl: string;
  status: boolean;
}
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(this.apiUrl);
  }

  create(data: FormData): Observable<ProductCategory> {
    return this.http.post<ProductCategory>(this.apiUrl, data);
  }

  update(id: string, data: FormData): Observable<ProductCategory> {
    return this.http.post<ProductCategory>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  enable(id: string): Observable<ProductCategory> {
    return this.http.put<ProductCategory>(`${this.apiUrl}/${id}/enable`, {});
  }

  disable(id: string): Observable<ProductCategory> {
    return this.http.put<ProductCategory>(`${this.apiUrl}/${id}/disable`, {});
  }
}
