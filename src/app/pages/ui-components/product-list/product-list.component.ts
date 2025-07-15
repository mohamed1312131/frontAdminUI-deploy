import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator }        from '@angular/material/paginator';
import { MatSort }             from '@angular/material/sort';
import { MatTableDataSource }  from '@angular/material/table';
import { ProductListDTO, ProductService } from '../service/ProductService';
import { ProductDetails, ProductDetailsComponent } from '../product-details/product-details.component';
import { MatDialog } from '@angular/material/dialog';
import { UpdateProductComponent } from '../update-product/update-product.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['select', 'nameSize', 'price', 'stock', 'category', 'action'];
  dataSource = new MatTableDataSource<ProductListDTO>([]);

  dateRanges = ['This Month', 'Last Month', 'This Year'];
  selectedRange = this.dateRanges[0];
  searchText = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  constructor(private productSvc: ProductService,private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.productSvc.getProducts().subscribe(list => {
      this.dataSource.data = list;

      // Sort accessor so “nameSize” sorts by title, “stock” by left+sold, etc.
      this.dataSource.sortingDataAccessor = (item, prop) => {
        switch (prop) {
          case 'nameSize': return item.title;
          case 'stock':    return item.stockLeft + item.sold;
          default:         return (item as any)[prop];
        }
      };
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  applyFilter() {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

 view(row: ProductListDTO) {
  this.productSvc.getProductDetails(row.id)
    .subscribe((details: ProductDetails) => {
      this.dialog.open(ProductDetailsComponent, {
        width: '800px',
        data: details
      });
    });
}
  edit(row: ProductListDTO) {
    // fetch full details, then open update dialog
    this.productSvc.getProductDetails(row.id).subscribe(details => {
      const ref = this.dialog.open(UpdateProductComponent, {
        width: '800px',
        data: details
      });
      ref.afterClosed().subscribe((updated: ProductDetails) => {
        if (updated) {
          // refresh table row
          this.productSvc.getProducts().subscribe(list => this.dataSource.data = list);
        }
      });
    });
  }
delete(p: ProductListDTO): void {
  if (!confirm(`Are you sure you want to delete "${p.title}"?`)) return;

  this.productSvc.deleteProduct(p.id).subscribe({
    next: () => {
      this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
      this.productSvc.getProducts().subscribe(list => this.dataSource.data = list);
    },
    error: (err) => {
      console.error('Delete failed', err);
      this.snackBar.open('Failed to delete product', 'Close', { duration: 3000 });
    }
  });
}

}
