import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Annotation } from 'src/app/models/annotations/annotation';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  private readonly apiUrl = `${environment.apiUrl}/api/annotations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Annotation[]>{
    return this.http.get<Annotation[]>(`${this.apiUrl}`);
  }

  search(page: number, pageSize: number,filters: Record<string, string>): Observable<PagedResponse<Annotation>> {
    return this.http.get<PagedResponse<Annotation>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  create(annotation: Partial<Annotation>): Observable<Annotation>{
    return this.http.post<Annotation>(`${this.apiUrl}`,annotation);
  }
}
