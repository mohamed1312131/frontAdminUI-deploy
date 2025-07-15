import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebinfoService {
  private readonly baseUrl = `${environment.apiUrl}/website`;

  constructor(private http: HttpClient) {}

  submitForm(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl, formData);
  }

  getWebsiteInfo(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }
}
