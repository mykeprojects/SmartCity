import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Official } from 'src/app/models/territorial/official';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';

@Injectable({ providedIn: 'root' })
export class OfficialService {
  private readonly apiUrl = `${environment.apiUrl}/api/officials`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Official[]> {
    return this.http.get<Official[]>(this.apiUrl);
  }

  getPaged(page: number, pageSize: number, q?: string): Observable<PagedResponse<Official>> {
    const extra: Record<string, string> = {};
    if (q?.trim()) {
      extra['q'] = q.trim();
    }
    return this.http.get<PagedResponse<Official>>(this.apiUrl, {
      params: buildPagedParams(page, pageSize, extra),
    });
  }

  getById(id: number): Observable<Official> {
    return this.http.get<Official>(`${this.apiUrl}/${id}`);
  }

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<Official>> {
    return this.http.get<PagedResponse<Official>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  create(official: Partial<Official>): Observable<Official> {
    return this.http.post<Official>(this.apiUrl, official);
  }

  update(id: number, official: Partial<Official>): Observable<Official> {
    return this.http.put<Official>(`${this.apiUrl}/${id}`, official);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
