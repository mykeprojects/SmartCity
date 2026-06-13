import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Annotation } from 'src/app/models/territorial/annotation';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  private readonly apiUrl = `${environment.apiUrl}/api/annotations`;

  constructor(private http: HttpClient) {}

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<Annotation>> {
    return this.http.get<PagedResponse<Annotation>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  searchFilter(filters: Record<string, any>): Observable<Annotation[]> {
    const filterUrl = `${this.apiUrl}/search`;
    
    // Construye los HttpParams recorriendo dinámicamente cada clave del objeto
    const params = Object.keys(filters).reduce((httpParams, key) => {
      const value = filters[key];
      // Evita enviar parámetros nulos o indefinidos si no lo deseas
      return value !== undefined && value !== null 
        ? httpParams.set(key, value.toString()) 
        : httpParams;
    }, new HttpParams());

    return this.http.get<Annotation[]>(filterUrl, { params });
  }
}
