import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Annotation } from 'src/app/models/territorial/annotation';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './api.util';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  private readonly apiUrl = `${environment.apiUrl}/api/annotations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Annotation[]> {
    return this.http.get<Annotation[]>(this.apiUrl);
  }

  getById(id: number): Observable<Annotation> {
    return this.http.get<Annotation>(`${this.apiUrl}/${id}`);
  }

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<Annotation>> {
    return this.http.get<PagedResponse<Annotation>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  searchFilter(filters: Record<string, string | number>): Observable<Annotation[]> {
    const params = Object.keys(filters).reduce((httpParams, key) => {
      const value = filters[key];
      return value !== undefined && value !== null
        ? httpParams.set(key, value.toString())
        : httpParams;
    }, new HttpParams());

    return this.http.get<Annotation[]>(`${this.apiUrl}/search`, { params });
  }

  create(annotation: Partial<Annotation>): Observable<Annotation> {
    return this.http.post<Annotation>(this.apiUrl, annotation);
  }

  update(id: number, annotation: Partial<Annotation>): Observable<Annotation> {
    return this.http.put<Annotation>(`${this.apiUrl}/${id}`, annotation);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
