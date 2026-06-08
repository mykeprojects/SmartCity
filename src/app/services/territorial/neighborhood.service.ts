import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Neighborhood } from 'src/app/models/territorial/neighborhood';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';

@Injectable({ providedIn: 'root' })
export class NeighborhoodService {
  private readonly apiUrl = `${environment.apiUrl}/api/neighborhoods`;

  constructor(private http: HttpClient) {}

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<Neighborhood>> {
    return this.http.get<PagedResponse<Neighborhood>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }
}
