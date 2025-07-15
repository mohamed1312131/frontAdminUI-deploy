import { Component, OnInit } from '@angular/core';
import {
  ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexLegend
} from 'ng-apexcharts';
import { ChartService } from '../ChartService';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend?: ApexLegend;
};

@Component({
  selector: 'app-sales-by-category',
  templateUrl: './sales-by-category.component.html',
  styleUrls: ['./sales-by-category.component.scss']
})
export class SalesByCategoryComponent implements OnInit {
  chartOptions: ChartOptions = {
    series: [],
    chart: { type: 'donut', height: 320 },
    labels: [],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 280 },
          legend: { position: 'bottom' }
        }
      }
    ]
  };

  isLoading = true;

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth(); // 0-based
  availableYears = [2025, 2026, 2027, 2028, 2029, 2030];
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    this.loadChartData(this.selectedYear, this.selectedMonth);
  }

  loadChartData(year: number, month: number): void {
    this.isLoading = true;
    this.chartService.getSalesByCategory(year, month + 1).subscribe((data: Record<string, number>) => {
      this.chartOptions.labels = Object.keys(data);
      this.chartOptions.series = Object.values(data);
      this.isLoading = false;
    });
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.loadChartData(year, this.selectedMonth);
  }

  onMonthChange(month: number): void {
    this.selectedMonth = month;
    this.loadChartData(this.selectedYear, month);
  }
}
