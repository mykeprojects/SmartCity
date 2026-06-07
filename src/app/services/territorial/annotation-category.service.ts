import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { AnnotationCategory } from 'src/app/models/territorial/annotation-category';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';

@Injectable({ providedIn: 'root' })
export class AnnotationCategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/annotation-categories`;

  constructor(private http: HttpClient) {}

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<AnnotationCategory>> {
    return this.http.get<PagedResponse<AnnotationCategory>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }
}
