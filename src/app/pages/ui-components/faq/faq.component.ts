import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
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

  constructor(private fb: FormBuilder, private faqService: FaqService, private snackBar: MatSnackBar) {
    this.faqForm = this.fb.group({
      faqs: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadFaqs();
  }

  get faqsArray(): FormArray {
    return this.faqForm.get('faqs') as FormArray;
  }

  loadFaqs(): void {
    this.faqService.getAll().subscribe(data => {
      this.faqs = data;
    });
  }

  addFaq(): void {
    this.faqsArray.push(this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required]
    }));
  }

  saveFaqs(): void {
    const newFaqs = this.faqForm.value.faqs;
    this.faqService.addManyFaqs(newFaqs).subscribe(() => {
      this.snackBar.open('FAQs added successfully!', 'Close', { duration: 3000 });
      this.faqForm.reset();
      this.faqsArray.clear();
      this.loadFaqs();
    });
  }

  editFaq(index: number): void {
    const faq = this.faqs[index];
    this.editingIndex = index;
    this.faqForm.setControl('faqs', this.fb.array([this.fb.group({
      question: [faq.question, Validators.required],
      answer: [faq.answer, Validators.required]
    })]));
  }

  updateFaq(): void {
    if (this.editingIndex === null) return;
    const updatedFaq = this.faqForm.value.faqs[0];
    const faqId = this.faqs[this.editingIndex].id;
    this.faqService.updateFaq(faqId, updatedFaq).subscribe(() => {
      this.snackBar.open('FAQ updated successfully!', 'Close', { duration: 3000 });
      this.editingIndex = null;
      this.faqForm.reset();
      this.faqsArray.clear();
      this.loadFaqs();
    });
  }

  deleteFaq(id: string): void {
    this.faqService.deleteFaq(id).subscribe(() => {
      this.snackBar.open('FAQ deleted.', 'Close', { duration: 2000 });
      this.loadFaqs();
    });
  }
}
