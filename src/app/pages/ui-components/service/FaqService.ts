import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface Faq {
  id?: string;
  question: string;
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly baseUrl = `${environment.apiUrl}/faqs`;

  constructor(private http: HttpClient) {}

  // 🟢 Get all FAQs
  getAll(): Observable<Faq[]> {
    return this.http.get<Faq[]>(this.baseUrl);
  }

  // 🟢 Add single FAQ
  addFaq(faq: Faq): Observable<Faq> {
    return this.http.post<Faq>(this.baseUrl, faq);
  }

  // 🟢 Add multiple FAQs
  addManyFaqs(faqs: Faq[]): Observable<Faq[]> {
    return this.http.post<Faq[]>(`${this.baseUrl}/bulk`, faqs);
  }

  // 🟡 Update single FAQ
  updateFaq(id: string, faq: Faq): Observable<Faq> {
    return this.http.put<Faq>(`${this.baseUrl}/${id}`, faq);
  }

  // 🔴 Delete single FAQ
  deleteFaq(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // 🔴 Delete multiple FAQs
  deleteManyFaqs(ids: string[]): Observable<void> {
    return this.http.request<void>('delete', `${this.baseUrl}/bulk`, { body: ids });
  }
}
