import { Component, OnInit } from '@angular/core';
import {
  ApexNonAxisChartSeries, ApexChart, ApexPlotOptions,
  ApexResponsive, ApexLegend, ApexDataLabels, ApexStroke, ApexTooltip
} from 'ng-apexcharts';
import { ChartService } from '../ChartService';

@Component({
  selector: 'app-total-sales',
  templateUrl: './total-sales.component.html',
  styleUrls: ['./total-sales.component.scss']
})
export class TotalSalesComponent implements OnInit {
  currentYear = new Date().getFullYear();
  availableYears = [2025, 2026, 2027, 2028, 2029, 2030];

  chartData = {
    current: 0,
    previous: 0,
    percentDiff: 0,
    formatted: '0'
  };

  yearlyChart = {
    series: [] as number[],
    chart: { type: 'donut', height: 150 } as ApexChart,
    dataLabels: { enabled: false } as ApexDataLabels,
    stroke: { width: 0 } as ApexStroke,
    legend: { show: false } as ApexLegend,
    tooltip: {
      y: { formatter: (val: number) => `${val.toFixed(1)} DT` }
    } as ApexTooltip,
    colors: ['#5B93FF', '#C9D6FF'],
    plotOptions: {
      pie: { donut: { size: '70%' } }
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

  constructor(private chartService: ChartService) {}

  ngOnInit() {
    this.loadYearData(this.currentYear);
  }

  loadYearData(year: number) {
    this.chartService.getSalesComparison(year).subscribe((data: { current: number; previous: number }) => {
      const { current, previous } = data;
      const percentDiff = previous > 0 ? ((current - previous) / previous) * 100 : 100;

      this.chartData = {
        current,
        previous,
        percentDiff: Math.round(percentDiff),
        formatted: current.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' DT'
      };

      this.yearlyChart.series = [current, previous];
    });
  }
}
