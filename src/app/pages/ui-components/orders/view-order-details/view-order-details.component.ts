import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../service/orderService';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, CommonModule],
  template: `
    <div class="confirmation-dialog">
      <h2 mat-dialog-title>
        <mat-icon>warning</mat-icon>
        Confirm Status Update
      </h2>
      <mat-dialog-content>
        <p>Are you sure you want to update order <strong>#{{ data.orderId }}</strong> status from 
        <strong>{{ data.currentStatus }}</strong> to <strong>{{ data.newStatus }}</strong>?</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close="false">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button mat-raised-button color="primary" [mat-dialog-close]="true">
          <mat-icon>check</mat-icon>
          Confirm Update
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 400px;
    }
    
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f57c00;
      margin-bottom: 16px;
    }
    
    mat-dialog-content p {
      font-size: 16px;
      line-height: 1.5;
      margin: 0;
    }
    
    mat-dialog-actions {
      gap: 8px;
      padding: 16px 0 0 0;
    }
    
    button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}

@Component({
  selector: 'app-view-order-details',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatCardModule,
    MatDividerModule,
    MatBadgeModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './view-order-details.component.html',
  styleUrls: ['./view-order-details.component.scss']
})
export class ViewOrderDetailsComponent {
  isUpdatingStatus = false;
  selectedStatus = '';
  statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orderService: OrderService,
    private dialogRef: MatDialogRef<ViewOrderDetailsComponent>,
    private dialog: MatDialog
  ) {
    this.selectedStatus = this.data.status;
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'processing': return 'primary';
      case 'pending': return 'warn';
      case 'cancelled': return 'error';
      default: return 'accent';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'check_circle';
      case 'processing': return 'sync';
      case 'pending': return 'schedule';
      case 'cancelled': return 'cancel';
      default: return 'info';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  onStatusChange(): void {
    if (this.selectedStatus === this.data.status) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        orderId: this.data.orderId,
        currentStatus: this.data.status,
        newStatus: this.selectedStatus
      },
      disableClose: true,
      panelClass: 'confirmation-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.updateOrderStatus(this.selectedStatus);
      } else {
        // Reset to original status if cancelled
        this.selectedStatus = this.data.status;
      }
    });
  }

  updateOrderStatus(newStatus: string): void {
    if (newStatus === this.data.status || this.isUpdatingStatus) {
      return;
    }

    this.isUpdatingStatus = true;
    
    this.orderService.updateStatus(this.data.id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.data.status = updatedOrder.status;
        this.selectedStatus = updatedOrder.status;
        this.isUpdatingStatus = false;
        // Close dialog and return updated data
        this.dialogRef.close({ updated: true, order: updatedOrder });
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.isUpdatingStatus = false;
        // Reset to original status on error
        this.selectedStatus = this.data.status;
        // You might want to show a toast/snackbar here
      }
    });
  }

  hasStatusChanged(): boolean {
    return this.selectedStatus !== this.data.status;
  }
}