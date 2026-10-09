import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientInquiry, ClientInquiryService, InquiryStatus } from '../service/clientInquiryService';
import { ConfirmDialogComponent } from '../faq/faq.component';

@Component({
  selector: 'app-client-inquiries',
  templateUrl: './client-inquiries.component.html',
  styleUrls: ['./client-inquiries.component.scss']
})
export class ClientInquiriesComponent implements OnInit {
  readonly displayedColumns = ['createdAt', 'name', 'email', 'interest', 'eventDate', 'status', 'actions'];
  readonly statuses: InquiryStatus[] = ['NEW', 'CONTACTED', 'CLOSED'];

  readonly labels: Record<string, string> = {
    EMAIL: 'Email',
    WHATSAPP: 'WhatsApp',
    PHONE_CALL: 'Phone call',
    IN_PERSON: 'In-person',
    VIRTUAL: 'Virtual',
    STANDARD_SIZE: 'Standard size (2-3 months)',
    CUSTOMIZED_DRESS: 'Customized dress (3-5 months)',
    SAMPLE_PURCHASE: 'Purchasing a sample'
  };

  dataSource = new MatTableDataSource<ClientInquiry>();
  expanded: ClientInquiry | null = null;
  selectedStatus: InquiryStatus | 'ALL' = 'ALL';
  searchTerm = '';
  loading = false;
  loadError = '';

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) { this.dataSource.paginator = p; }
  @ViewChild(MatSort) set sort(s: MatSort) { this.dataSource.sort = s; }

  constructor(
    private inquiryService: ClientInquiryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (row, filter) => {
      const { status, term } = JSON.parse(filter) as { status: string; term: string };
      if (status !== 'ALL' && row.status !== status) return false;
      if (!term) return true;
      return [row.name, row.email, row.phone, row.stylistName]
        .some(value => value?.toLowerCase().includes(term));
    };
  }

  ngOnInit(): void {
    this.fetchInquiries();
  }

  fetchInquiries(): void {
    this.loading = true;
    this.loadError = '';
    this.inquiryService.getAll().subscribe({
      next: data => {
        this.dataSource.data = data;
        this.applyFilter();
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.loadError = err.status === 401 || err.status === 403
          ? 'Your session has expired. Please log in again.'
          : 'Could not load inquiries.';
      }
    });
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({
      status: this.selectedStatus,
      term: this.searchTerm.trim().toLowerCase()
    });
    this.dataSource.paginator?.firstPage();
  }

  countByStatus(status: InquiryStatus): number {
    return this.dataSource.data.filter(i => i.status === status).length;
  }

  toggle(row: ClientInquiry): void {
    this.expanded = this.expanded === row ? null : row;
  }

  changeStatus(row: ClientInquiry, status: InquiryStatus): void {
    const previous = row.status;
    row.status = status;
    this.inquiryService.updateStatus(row.id, status).subscribe({
      next: updated => Object.assign(row, updated),
      error: () => {
        row.status = previous;
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteInquiry(row: ClientInquiry): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete inquiry',
        message: `Delete the inquiry from ${row.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.inquiryService.delete(row.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(i => i.id !== row.id);
          this.snackBar.open('Inquiry deleted', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Failed to delete inquiry', 'Close', { duration: 3000 })
      });
    });
  }

  stylistLabel(row: ClientInquiry): string {
    if (row.workingWithStylist == null) return '-';
    return row.workingWithStylist ? `Yes${row.stylistName ? ' (' + row.stylistName + ')' : ''}` : 'No';
  }
}
