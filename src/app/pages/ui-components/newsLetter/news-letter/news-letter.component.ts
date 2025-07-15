import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailComposerDialogComponent } from '../email-composer-dialog/email-composer-dialog.component';

@Component({
  selector: 'app-news-letter',
  templateUrl: './news-letter.component.html',
  styleUrls: ['./news-letter.component.scss']
})
export class NewsLetterComponent implements OnInit {
  displayedColumns: string[] = ['select', 'email', 'actions'];
  dataSource = new MatTableDataSource<any>();
  selection = new Set<string>();
  searchKey = '';
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmails();
  }

  loadEmails(): void {
    this.http.get<any[]>(`${environment.apiUrl}/newsletter`).subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchKey = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.searchKey;
  }

  toggleSelection(email: string): void {
    this.selection.has(email) ? this.selection.delete(email) : this.selection.add(email);
  }

  isSelected(email: string): boolean {
    return this.selection.has(email);
  }

deleteEmail(email: string): void {
  if (confirm(`Are you sure you want to delete ${email}?`)) {
    this.http.delete(`${environment.apiUrl}/newsletter/${email}`).subscribe(() => {
      this.snackBar.open('Email deleted.', 'Close', { duration: 2000 });
      this.loadEmails();
      this.selection.delete(email); // remove from selected list if selected
    });
  }
}

  openEmailDialog(): void {
    const dialogRef = this.dialog.open(EmailComposerDialogComponent, {
      width: '600px', // Wider dialog for better UX
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.uploadImageIfNeeded(result).then(updatedResult => {
          this.sendBulkEmail(updatedResult);
        });
      }
    });
  }

  async uploadImageIfNeeded(data: any): Promise<any> {
    if (data.imageFile) {
      const formData = new FormData();
      formData.append('file', data.imageFile);
      formData.append('upload_preset', 'your_upload_preset'); // Replace with actual preset

      try {
        const response: any = await this.http.post('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', formData).toPromise();
        data.imageUrl = response.secure_url;
      } catch (error) {
        this.snackBar.open('Image upload failed.', 'Close', { duration: 3000 });
      }
    }
    return data;
  }

  sendBulkEmail(data: {
    subject: string,
    title: string,
    subtitle: string,
    body: string,
    imageUrl: string,
    productLink: string
  }): void {
    const payload = {
      emails: Array.from(this.selection),
      ...data
    };
    this.http.post(`${environment.apiUrl}/newsletter/send`, payload).subscribe(() => {
      this.snackBar.open('Emails sent successfully.', 'Close', { duration: 3000 });
      this.selection.clear();
    });
  }
}