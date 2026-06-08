import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environments';
import { City } from 'src/app/models/territorial/city';
import { buildPagedParams, isPagedResponse } from './territorial-api.util';
import { PagedResponse } from 'src/app/models/territorial/paged-response';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly apiUrl = `${environment.apiUrl}/api/cities`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<City> {
    return this.http.get<City>(`${this.apiUrl}/${id}`);
  }

  getAll(pageSize = 500): Observable<City[]> {
    return this.http
      .get<PagedResponse<City> | City[]>(this.apiUrl, {
        params: buildPagedParams(1, pageSize),
      })
      .pipe(
        map((response) => {
          if (isPagedResponse<City>(response)) {
            return response.items;
          }
          return Array.isArray(response) ? response : [];
        })
      );
  }

  getByDepartment(idDepartment: number, pageSize = 500): Observable<City[]> {
    return this.http
      .get<PagedResponse<City> | City[]>(`${this.apiUrl}/search`, {
        params: buildPagedParams(1, pageSize, { id_department: String(idDepartment) }),
      })
      .pipe(
        map((response) => {
          if (isPagedResponse<City>(response)) {
            return response.items;
          }
          return response;
        })
      );
  }
}
