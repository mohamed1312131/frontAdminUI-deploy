import { Component, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';
import { AddCarrouselComponent } from '../add-carrousel/add-carrousel.component';
import { Carousel, CarouselService } from '../../service/carrouselService';
import { UpdateCarrouselComponent } from '../update-carrousel/update-carrousel.component';
import { AuthService } from 'src/app/pages/authentication/AuthService';

@Component({
  selector: 'app-manage-carrousel',
  templateUrl: './manage-carrousel.component.html',
  styleUrl: './manage-carrousel.component.scss'
})
export class ManageCarrouselComponent {
 displayedColumns: string[] = ['image', 'title', 'description', 'status', 'actions'];
  dataSource = new MatTableDataSource<Carousel>();

  @ViewChild(MatSort) sort!: MatSort;

constructor(
  private carouselService: CarouselService,
  private snackBar: MatSnackBar,
  private dialog: MatDialog,
  private authService: AuthService
) {}

  ngOnInit(): void {
    this.authService.checkSession().subscribe();
    this.fetchData();
  }

  fetchData(): void {
    this.carouselService.getAll().subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onDelete(id: string): void {
  if (confirm('Are you sure you want to delete this carousel?')) {
    this.carouselService.delete(id).subscribe(() => {
      this.snackBar.open('Carousel deleted', 'Close', { duration: 2000 });
      this.fetchData();
    });
  }
}

  onDisable(id: string): void {
    this.carouselService.disable(id).subscribe(() => {
      this.snackBar.open('Carousel disabled', 'Close', { duration: 2000 });
      this.fetchData();
    });
  }

onEdit(id: string): void {
  this.carouselService.getById(id).subscribe(carousel => {
    const dialogRef = this.dialog.open(UpdateCarrouselComponent, {
      width: '500px',
      data: carousel
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Carousel updated successfully', 'Close', { duration: 2000 });
        this.fetchData(); // refresh the table
      }
    });
  });
}


  openAddDialog(): void {
  const dialogRef = this.dialog.open(AddCarrouselComponent, {
    width: '500px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) this.fetchData(); // Refresh list if a new carousel was added
  });
}
onEnable(id: string): void {
  this.carouselService.enable(id).subscribe(() => {
    this.snackBar.open('Carousel enabled', 'Close', { duration: 2000 });
    this.fetchData();
  });
}


}