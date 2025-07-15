import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
export interface Note {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  status: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NoteService {
  private baseUrl = `${environment.apiUrl}/notes`;

  constructor(private http: HttpClient) {}

  getAllNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.baseUrl);
  }

  enableNote(id: string): Observable<Note> {
    return this.http.put<Note>(`${this.baseUrl}/${id}/enable`, {});
  }

  disableNote(id: string): Observable<Note> {
    return this.http.put<Note>(`${this.baseUrl}/${id}/disable`, {});
  }

  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
