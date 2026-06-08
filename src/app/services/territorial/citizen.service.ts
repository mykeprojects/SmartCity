import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Citizen } from 'src/app/models/territorial/citizen';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';

@Injectable({ providedIn: 'root' })
export class CitizenService {
  private readonly apiUrl = `${environment.apiUrl}/api/citizens`;

  constructor(private http: HttpClient) {}

  getPaged(page: number, pageSize: number, q?: string): Observable<PagedResponse<Citizen>> {
    const extra: Record<string, string> = {};
    if (q?.trim()) {
      extra['q'] = q.trim();
    }
    return this.http.get<PagedResponse<Citizen>>(this.apiUrl, {
      params: buildPagedParams(page, pageSize, extra),
    });
  }

  getById(id: number): Observable<Citizen> {
    return this.http.get<Citizen>(`${this.apiUrl}/${id}`);
  }

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<Citizen>> {
    return this.http.get<PagedResponse<Citizen>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  create(citizen: Partial<Citizen>): Observable<Citizen> {
    return this.http.post<Citizen>(this.apiUrl, citizen);
  }

  update(id: number, citizen: Partial<Citizen>): Observable<Citizen> {
    return this.http.put<Citizen>(`${this.apiUrl}/${id}`, citizen);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
