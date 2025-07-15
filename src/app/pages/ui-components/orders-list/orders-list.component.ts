// orders-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { OrderDTO, OrderService } from '../service/orderService';
import { MatDialog } from '@angular/material/dialog';
import { ViewOrderDetailsComponent } from '../orders/view-order-details/view-order-details.component';
import { MatChipsModule } from '@angular/material/chips';


@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit {
columns: string[] = ['orderId', 'createdAt', 'email', 'status', 'grandTotal', 'items', 'action'];
  dataSource = new MatTableDataSource<OrderDTO>();
  selectedStatus = 'All';
  selectedDateRange = 'All';
  dateRanges = ['All', 'Last Week', 'Last Month', 'Last Year', 'Year to Date'];

  fullOrders: OrderDTO[] = [];

  @ViewChild(MatSort) sort!: MatSort;

constructor(private orderService: OrderService, private dialog: MatDialog) {}


  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
  this.orderService.getAll().subscribe(orders => {
    this.fullOrders = orders;
    this.applyCombinedFilters(); // run filters after load
    this.dataSource.sort = this.sort;
  });
}
applyCombinedFilters(): void {
  let filtered = [...this.fullOrders];

  // Filter by status
  if (this.selectedStatus !== 'All') {
    const status = this.selectedStatus.toLowerCase();
    filtered = filtered.filter(o => o.status?.toLowerCase() === status);
  }

  // Filter by date range
  if (this.selectedDateRange !== 'All') {
    const now = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (this.selectedDateRange) {
      case 'Last Week':
        fromDate = new Date();
        fromDate.setDate(now.getDate() - 7);
        break;

      case 'Last Month':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        toDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;

      case 'Last Year':
        fromDate = new Date(now.getFullYear() - 1, 0, 1);
        toDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;

      case 'Year to Date':
        fromDate = new Date();
        fromDate.setDate(now.getDate() - 365);
        break;
    }

    filtered = filtered.filter(o => {
      const created = new Date(o.createdAt);
      if (isNaN(created.getTime())) return false;
      if (fromDate && created < fromDate) return false;
      if (toDate && created > toDate) return false;
      return true;
    });
  }

  this.dataSource.data = filtered;
}








  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

applyStatusFilter() {
  if (this.selectedStatus === 'All') {
    this.fetchOrders();
  } else {
    const status = this.selectedStatus.toLowerCase();
    this.dataSource.data = this.dataSource.data.filter(o =>
      o.status?.toLowerCase() === status
    );
  }
}


  applyDateFilter() {
    const now = new Date();
    let cutoff = new Date();

    switch (this.selectedDateRange) {
      case 'Last Week': cutoff.setDate(now.getDate() - 7); break;
      case 'Last Month': cutoff.setMonth(now.getMonth() - 1); break;
      case 'Last Year': cutoff.setFullYear(now.getFullYear() - 1); break;
      default: return this.fetchOrders();
    }

    this.dataSource.data = this.dataSource.data.filter(o => new Date(o.createdAt) >= cutoff);
  }

  delete(id: string) {
    this.orderService.deleteOrder(id).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(o => o.id !== id);
    });
  }

view(row: OrderDTO) {
  this.dialog.open(ViewOrderDetailsComponent, {
    width: '500px',
    data: row
  });
}


  edit(row: OrderDTO) {
    console.log('Edit order', row);
  }

statusClass(status: string): string {
  const normalized = status?.toLowerCase();
  return {
    'pending': 'status-badge pending',
    'processing': 'status-badge processing',
    'completed': 'status-badge completed',
    'cancelled': 'status-badge cancelled'
  }[normalized] || 'status-badge default';
}

getItemSummary(row: OrderDTO): string {
  return row.products.map(p => `${p.productName} (${p.size}) x${p.quantity}`).join(', ');
}
selectStatus(status: string) {
  this.selectedStatus = status;
  this.applyCombinedFilters();
}


}
