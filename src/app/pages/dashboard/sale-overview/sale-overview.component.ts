import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions,
  ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke,
  ApexLegend, ApexGrid, ApexMarkers
} from 'ng-apexcharts';
import { ChartService } from '../chartService';

export interface salesOverviewChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  grid: ApexGrid;
  marker: ApexMarkers;
}

@Component({
  selector: 'app-sale-overview',
  templateUrl: './sale-overview.component.html',
  styleUrls: ['./sale-overview.component.scss']
})
export class SaleOverviewComponent implements OnInit {
  selectedYear = 2025;
  availableYears = [2025, 2026, 2027, 2028, 2029, 2030];
  isChartReady = false;

  salesOverviewChart: salesOverviewChart = {
    series: [],
    chart: { type: 'bar', height: 350 },
    dataLabels: { enabled: false },
    plotOptions: { bar: { horizontal: false, columnWidth: '45%' } },
    yaxis: { title: { text: 'Revenue (DT TND)' } },
    xaxis: { categories: [] },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (val: number) => `${val} DT` }
    },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    legend: { position: 'top' },
    grid: { show: true, borderColor: '#e0e0e0' },
    marker: { size: 0 }
  };

  constructor(
    private chartService: ChartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadSalesByYear(this.selectedYear);
  }

  loadSalesByYear(year: number) {
    this.isChartReady = false;

    this.chartService.getSalesByYear(year).subscribe(data => {
      const monthLabels = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const monthlySales = Array.from({ length: 12 }, (_, i) => {
        const key = (i + 1).toString().padStart(2, '0');
        return Math.round((data[key] || 0) * 100) / 100;
      });

      this.salesOverviewChart.series = [
        { name: 'Revenue', data: monthlySales }
      ];
      this.salesOverviewChart.xaxis = { categories: monthLabels };

      this.isChartReady = true;
      this.cdr.detectChanges();
    });
  }
}
