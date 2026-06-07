import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Commune } from 'src/app/models/territorial/commune';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';

@Injectable({ providedIn: 'root' })
export class CommuneService {
  private readonly apiUrl = `${environment.apiUrl}/api/communes`;

  constructor(private http: HttpClient) {}

  getPaged(page: number, pageSize: number): Observable<PagedResponse<Commune>> {
    return this.http.get<PagedResponse<Commune>>(this.apiUrl, {
      params: buildPagedParams(page, pageSize),
    });
  }

  getAll(): Observable<Commune[]> {
    return this.http.get<Commune[]>(this.apiUrl);
  }

  getById(id: number): Observable<Commune> {
    return this.http.get<Commune>(`${this.apiUrl}/${id}`);
  }

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<Commune>> {
    return this.http.get<PagedResponse<Commune>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  create(commune: Partial<Commune>): Observable<Commune> {
    return this.http.post<Commune>(this.apiUrl, commune);
  }

  update(id: number, commune: Partial<Commune>): Observable<Commune> {
    return this.http.put<Commune>(`${this.apiUrl}/${id}`, commune);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
