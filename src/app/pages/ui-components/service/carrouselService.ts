import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Carousel {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  status: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CarouselService {
  private baseUrl = `${environment.apiUrl}/carousels`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Carousel[]> {
    return this.http.get<Carousel[]>(`${this.baseUrl}`);
  }

  getById(id: string): Observable<Carousel> {
    return this.http.get<Carousel>(`${this.baseUrl}/${id}`);
  }

  create(formData: FormData): Observable<Carousel> {
    return this.http.post<Carousel>(this.baseUrl, formData);
  }

  update(id: string, formData: FormData): Observable<Carousel> {
    return this.http.put<Carousel>(`${this.baseUrl}/${id}`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  disable(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/disable`, {});
  }
  enable(id: string): Observable<void> {
  return this.http.put<void>(`${this.baseUrl}/${id}/enable`, {});
}

}