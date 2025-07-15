import { Component, OnInit } from '@angular/core';
import {
  ApexNonAxisChartSeries, ApexChart, ApexResponsive,
  ApexLegend
} from 'ng-apexcharts';
import { ChartService } from '../chartService';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  legend?: ApexLegend;
};

@Component({
  selector: 'app-sales-by-region',
  templateUrl: './sales-by-region.component.html',
  styleUrls: ['./sales-by-region.component.scss']
})
export class SalesByRegionComponent implements OnInit {
  chartOptions: ChartOptions = {
    series: [],
    chart: {
      type: 'donut',
      height: 320
    },
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

  ngOnInit() {
    this.loadChartData(this.selectedYear, this.selectedMonth);
  }

  loadChartData(year: number, month: number) {
    this.isLoading = true;

    this.chartService.getSalesByRegion(year, month + 1).subscribe(data => {
      const regions = Object.keys(data);
      const sales = Object.values(data);

      this.chartOptions.labels = regions;
      this.chartOptions.series = sales;

      this.isLoading = false;
    });
  }

  onYearChange(year: number) {
    this.selectedYear = year;
    this.loadChartData(year, this.selectedMonth);
  }

  onMonthChange(month: number) {
    this.selectedMonth = month;
    this.loadChartData(this.selectedYear, month);
  }
}
