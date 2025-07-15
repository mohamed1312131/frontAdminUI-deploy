import { Component, OnInit } from '@angular/core';
import {
  ApexNonAxisChartSeries, ApexChart, ApexPlotOptions,
  ApexResponsive, ApexLegend, ApexDataLabels, ApexStroke, ApexTooltip
} from 'ng-apexcharts';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-total-visitor',
  templateUrl: './total-visitor.component.html',
  styleUrls: ['./total-visitor.component.scss']
})
export class TotalVisitorComponent implements OnInit {
  currentYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth(); // 0-based index
  monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  currentCount = 0;
  previousCount = 0;
  percentChange = 0;

  monthlyChart = {
    series: [] as ApexNonAxisChartSeries,
    chart: {
      type: 'donut',
      height: 200
    } as ApexChart,
    dataLabels: { enabled: false } as ApexDataLabels,
    stroke: { width: 0 } as ApexStroke,
    legend: { show: false } as ApexLegend,
    tooltip: {
      y: { formatter: (val: number) => `${val.toFixed(0)} visits` }
    } as ApexTooltip,
    colors: ['#FF6B6B', '#FFE0E0'],
    plotOptions: {
      pie: {
        donut: { size: '75%' }
      }
    } as ApexPlotOptions,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' }
        }
      }
    ] as ApexResponsive[]
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMonthlyVisitors(this.selectedMonth);
  }

  loadMonthlyVisitors(month: number) {
    const apiUrl = `${environment.apiUrl}/orders/monthly?month=${month + 1}&year=${this.currentYear}`;
    this.http.get<{ current: number; previous: number }>(apiUrl).subscribe(data => {
      this.currentCount = data.current;
      this.previousCount = data.previous;
      this.percentChange = this.previousCount > 0
        ? Math.round(((this.currentCount - this.previousCount) / this.previousCount) * 100)
        : 100;

      this.monthlyChart.series = [this.currentCount, this.previousCount];
    });
  }
}
