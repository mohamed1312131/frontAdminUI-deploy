import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { AddCategoryComponent } from '../add-category/add-category.component';
import { UpdateCategoryComponent } from '../update-category/update-category.component';
import { CategoryService } from '../../service/CategoryService';
import { ProductCategory } from '../../service/ProductService';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  displayedColumns: string[] = ['image', 'name', 'status', 'actions'];
  dataSource = new MatTableDataSource<ProductCategory>();

  constructor(private categoryService: CategoryService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.categoryService.getAll().subscribe(categories => {
      this.dataSource.data = categories;
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '600px',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchCategories();
    });
  }

  onEdit(id: string): void {
    const category = this.dataSource.data.find(c => c.id === id);
    if (!category) return;

    const dialogRef = this.dialog.open(UpdateCategoryComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: category
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchCategories();
    });
  }

  onEnable(id: string): void {
    this.categoryService.enable(id).subscribe(() => this.fetchCategories());
  }

  onDisable(id: string): void {
    this.categoryService.disable(id).subscribe(() => this.fetchCategories());
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.delete(id).subscribe(() => this.fetchCategories());
    }
  }
}
