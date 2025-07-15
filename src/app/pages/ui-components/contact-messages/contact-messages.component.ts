import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-contact-messages',
  templateUrl: './contact-messages.component.html',
  styleUrls: ['./contact-messages.component.scss']
})
export class ContactMessagesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'phone', 'subject', 'message', 'actions'];
  dataSource = new MatTableDataSource<any>();
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchMessages();
  }

fetchMessages(): void {
  this.http.get<any[]>(`${environment.apiUrl}/contact`).subscribe(data => {
    // Add showFull property to each message
    this.dataSource.data = data.map(msg => ({ ...msg, showFull: false }));
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  });
}


  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }
  toggleMessage(msg: any): void {
  msg.showFull = !msg.showFull;
}

  deleteMessage(id: string): void {
    if (confirm('Are you sure you want to delete this message?')) {
      this.http.delete(`${environment.apiUrl}/contact/${id}`).subscribe(() => {
        this.fetchMessages();
      });
    }
  }
}
