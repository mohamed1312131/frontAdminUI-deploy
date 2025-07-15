import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface OrderedProduct {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
}

export interface OrderDTO {
  id: string;              // internal ID
  orderId: string;         // custom order ID like hz23538
  createdAt: string;
  email: string;
  status: string;
  total: number;
  grandTotal: number;
  delivered: boolean;
  products: OrderedProduct[];
}
@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(this.apiUrl);
  }

  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  updateStatus(id: string, status: string): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.apiUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  // add update, view if needed
}
