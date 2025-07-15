import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagesRoutes } from './pages.routing.module';
import { MaterialModule } from '../material.module';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';
import { AppDashboardComponent } from './dashboard/dashboard.component';
import { LatestOrdersComponent } from './dashboard/latest-orders/latest-orders.component';

import { SaleOverviewComponent } from './dashboard/sale-overview/sale-overview.component';
import { SalesByRegionComponent } from './dashboard/sales-by-region/sales-by-region.component';
import { TopSellingProductComponent } from './dashboard/top-selling-product/top-selling-product.component';
import { TotalSalesComponent } from './dashboard/total-sales/total-sales.component';
import { TotalVisitorComponent } from './dashboard/total-visitor/total-visitor.component';
import { SalesByCategoryComponent } from './dashboard/sales-by-category/sales-by-category.component';

@NgModule({
  declarations: [AppDashboardComponent,LatestOrdersComponent, SaleOverviewComponent ,SalesByCategoryComponent, SalesByRegionComponent, TopSellingProductComponent, TotalSalesComponent, TotalVisitorComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    NgApexchartsModule,
    RouterModule.forChild(PagesRoutes),
    TablerIconsModule.pick(TablerIcons),
  ],
  exports: [TablerIconsModule],
})
export class PagesModule {}
