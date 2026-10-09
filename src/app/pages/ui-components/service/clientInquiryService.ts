import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export type InquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED';

export interface ClientInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  preferredContactMethod?: 'EMAIL' | 'WHATSAPP' | 'PHONE_CALL' | null;
  eventDate?: string | null;
  appointmentDatePreference?: string | null;
  appointmentTypes: ('IN_PERSON' | 'VIRTUAL')[];
  interest?: 'STANDARD_SIZE' | 'CUSTOMIZED_DRESS' | 'SAMPLE_PURCHASE' | null;
  stylesOfInterest?: string | null;
  discoverySource?: string | null;
  workingWithStylist?: boolean | null;
  stylistName?: string | null;
  status: InquiryStatus;
  createdAt: string;
  updatedAt?: string;
}

// These endpoints require the admin session cookie, unlike most of the API.
@Injectable({ providedIn: 'root' })
export class ClientInquiryService {
  private readonly baseUrl = `${environment.apiUrl}/inquiries`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ClientInquiry[]> {
    return this.http.get<ClientInquiry[]>(this.baseUrl, { withCredentials: true });
  }

  updateStatus(id: string, status: InquiryStatus): Observable<ClientInquiry> {
    return this.http.patch<ClientInquiry>(`${this.baseUrl}/${id}/status`, { status }, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}
