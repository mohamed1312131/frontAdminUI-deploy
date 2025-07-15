import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TopSellingProductDTO {
  productId: string;
  productName: string;
  imageUrl: string;
  totalSalesCount: number;
  totalRevenue: number;
  totalStock: number;
  stockLeftBySize: { [size: string]: number };
}

@Injectable({ providedIn: 'root' })
export class ChartService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getSalesByYear(year: number): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/sales/yearly?year=${year}`);
  }
  getSalesComparison(year: number): Observable<{ current: number; previous: number }> {
  return this.http.get<{ current: number; previous: number }>(
    `${this.apiUrl}/sales/year-comparison?year=${year}`
  );
  }
  getMonthlyVisitors(month: number, year: number): Observable<{ current: number, previous: number }> {
  return this.http.get<{ current: number, previous: number }>(
    `${this.apiUrl}/visits/monthly?month=${month}&year=${year}`
  );
}
getSalesByRegion(year: number, month: number): Observable<Record<string, number>> {
  return this.http.get<Record<string, number>>(
    `${this.apiUrl}/sales/by-region?year=${year}&month=${month}`
  );
}
getSalesByCategory(year: number, month: number): Observable<Record<string, number>> {
  return this.http.get<Record<string, number>>(
    `${this.apiUrl}/sales/by-category?year=${year}&month=${month}`
  );
}
getTopSellingProducts(year: number, month: number): Observable<TopSellingProductDTO[]> {
    return this.http.get<TopSellingProductDTO[]>(
      `${this.apiUrl}/top-products?year=${year}&month=${month}`
    );
  }


}
