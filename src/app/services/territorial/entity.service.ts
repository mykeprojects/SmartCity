import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Entity } from 'src/app/models/territorial/entity';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { appendFormField, buildPagedParams } from './territorial-api.util';

@Injectable({ providedIn: 'root' })
export class EntityService {
  private readonly apiUrl = `${environment.apiUrl}/api/entities`;

  constructor(private http: HttpClient) {}

  getPaged(page: number, pageSize: number, q?: string): Observable<PagedResponse<Entity>> {
    const extra: Record<string, string> = {};
    if (q?.trim()) {
      extra['q'] = q.trim();
    }
    const params = buildPagedParams(page, pageSize, extra);
    return this.http.get<PagedResponse<Entity>>(this.apiUrl, { params });
  }

  getAll(): Observable<Entity[]> {
    return this.http.get<Entity[]>(this.apiUrl);
  }

  getById(id: number): Observable<Entity> {
    return this.http.get<Entity>(`${this.apiUrl}/${id}`);
  }

  search(page: number, pageSize: number, filters: Record<string, string>): Observable<PagedResponse<Entity>> {
    let params = buildPagedParams(page, pageSize, filters);
    return this.http.get<PagedResponse<Entity>>(`${this.apiUrl}/search`, { params });
  }

  create(entity: Partial<Entity>, logoFile?: File): Observable<Entity> {
    return this.http.post<Entity>(this.apiUrl, this.toFormData(entity, logoFile));
  }

  update(id: number, entity: Partial<Entity>, logoFile?: File): Observable<Entity> {
    return this.http.put<Entity>(`${this.apiUrl}/${id}`, this.toFormData(entity, logoFile));
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  private toFormData(entity: Partial<Entity>, logoFile?: File): FormData {
    const formData = new FormData();
    appendFormField(formData, 'name', entity.name);
    appendFormField(formData, 'nit', entity.nit);
    appendFormField(formData, 'phone', entity.phone);
    appendFormField(formData, 'email', entity.email);
    appendFormField(formData, 'address', entity.address);
    appendFormField(formData, 'status', entity.status);
    if (logoFile) {
      formData.append('file', logoFile);
    }
    return formData;
  }
}
