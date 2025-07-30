import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogActions } from "@angular/material/dialog";
import { FaqService } from "../service/FaqService";

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {
  faqForm: FormGroup;
  faqs: any[] = [];
  editingIndex: number | null = null;
  isLoading: boolean = false;
  bulkMode: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private faqService: FaqService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.faqForm = this.fb.group({
      faqs: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadFaqs();
    this.addFaq(); // Start with one empty FAQ
  }

  get faqsArray(): FormArray {
    return this.faqForm.get('faqs') as FormArray;
  }

  loadFaqs(): void {
    this.isLoading = true;
    this.faqService.getAll().subscribe({
      next: (data) => {
        this.faqs = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.showErrorMessage('Failed to load FAQs');
        this.isLoading = false;
      }
    });
  }

  addFaq(): void {
    const faqGroup = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(10)]],
      answer: ['', [Validators.required, Validators.minLength(20)]]
    });
    
    this.faqsArray.push(faqGroup);
  }

  removeFaq(index: number): void {
    if (this.faqsArray.length > 1) {
      this.faqsArray.removeAt(index);
    }
  }

  saveFaqs(): void {
    if (this.faqForm.invalid) {
      this.markFormGroupTouched(this.faqForm);
      this.showErrorMessage('Please fill in all required fields correctly');
      return;
    }

    const newFaqs = this.faqForm.value.faqs;
    this.isLoading = true;

    this.faqService.addManyFaqs(newFaqs).subscribe({
      next: () => {
        this.showSuccessMessage('FAQs added successfully!');
        this.resetForm();
        this.loadFaqs();
      },
      error: (error) => {
        this.showErrorMessage('Failed to save FAQs. Please try again.');
        this.isLoading = false;
      }
    });
  }

  editFaq(index: number): void {
    const faq = this.faqs[index];
    this.editingIndex = index;
    
    // Clear existing form array and add the FAQ to edit
    this.faqsArray.clear();
    this.faqsArray.push(this.fb.group({
      question: [faq.question, [Validators.required, Validators.minLength(10)]],
      answer: [faq.answer, [Validators.required, Validators.minLength(20)]]
    }));

    // Scroll to form
    this.scrollToTop();
  }

  updateFaq(): void {
    if (this.editingIndex === null || this.faqForm.invalid) {
      this.markFormGroupTouched(this.faqForm);
      this.showErrorMessage('Please fill in all required fields correctly');
      return;
    }

    const updatedFaq = this.faqForm.value.faqs[0];
    const faqId = this.faqs[this.editingIndex].id;
    this.isLoading = true;

    this.faqService.updateFaq(faqId, updatedFaq).subscribe({
      next: () => {
        this.showSuccessMessage('FAQ updated successfully!');
        this.cancelEdit();
        this.loadFaqs();
      },
      error: (error) => {
        this.showErrorMessage('Failed to update FAQ. Please try again.');
        this.isLoading = false;
      }
    });
  }

  deleteFaq(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete FAQ',
        message: 'Are you sure you want to delete this FAQ? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(id);
      }
    });
  }

  private performDelete(id: string): void {
    this.faqService.deleteFaq(id).subscribe({
      next: () => {
        this.showSuccessMessage('FAQ deleted successfully');
        this.loadFaqs();
      },
      error: (error) => {
        this.showErrorMessage('Failed to delete FAQ. Please try again.');
      }
    });
  }

  deleteSelectedFaqs(selectedOptions: any[]): void {
    if (selectedOptions.length === 0) return;

    const selectedIds = selectedOptions.map(option => option.value);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Multiple FAQs',
        message: `Are you sure you want to delete ${selectedIds.length} FAQs? This action cannot be undone.`,
        confirmText: 'Delete All',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performBulkDelete(selectedIds);
      }
    });
  }

  private performBulkDelete(ids: string[]): void {
    this.isLoading = true;
    this.faqService.deleteManyFaqs(ids).subscribe({
      next: () => {
        this.showSuccessMessage(`${ids.length} FAQs deleted successfully`);
        this.bulkMode = false;
        this.loadFaqs();
      },
      error: (error) => {
        this.showErrorMessage('Failed to delete FAQs. Please try again.');
        this.isLoading = false;
      }
    });
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.faqForm.reset();
    this.faqsArray.clear();
    this.addFaq(); // Add one empty FAQ
    this.isLoading = false;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          }
        });
      }
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 6000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Utility method to get form control errors for better UX
  getFieldError(fieldName: string, index: number = 0): string {
    const control = this.faqsArray.at(index)?.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }
}

// Confirmation Dialog Component (create separately)
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">{{ data.cancelText }}</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">{{ data.confirmText }}</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 300px;
    }
    mat-dialog-content p {
      margin: 1rem 0;
      color: #4b5563;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}