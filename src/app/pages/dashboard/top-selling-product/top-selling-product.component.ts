// src/app/components/top-selling-product/top-selling-product.component.ts
import { Component, OnInit } from '@angular/core';
import { ChartService, TopSellingProductDTO } from '../ChartService';


@Component({
  selector: 'app-top-selling-product',
  templateUrl: './top-selling-product.component.html',
  styleUrls: ['./top-selling-product.component.scss']
})
export class TopSellingProductComponent implements OnInit {
  displayedColumns = ['image', 'productName', 'totalSalesCount', 'totalRevenue', 'totalStock', 'stockLeftBySize'];
  dataSource: TopSellingProductDTO[] = [];

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  loading = false;

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private dashboardService: ChartService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.dashboardService.getTopSellingProducts(this.selectedYear, this.selectedMonth).subscribe({
      next: (data: TopSellingProductDTO[]) => {
        this.dataSource = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
