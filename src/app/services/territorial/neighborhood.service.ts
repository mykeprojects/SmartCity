import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Neighborhood } from 'src/app/models/territorial/neighborhood';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';

@Injectable({ providedIn: 'root' })
export class NeighborhoodService {
  private readonly apiUrl = `${environment.apiUrl}/api/neighborhoods`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Neighborhood[]>{
    return this.http.get<Neighborhood[]>(this.apiUrl);
  }

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<Neighborhood>> {
    return this.http.get<PagedResponse<Neighborhood>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  getById(id: number): Observable<Neighborhood>{
    return this.http.get<Neighborhood>(`${this.apiUrl}/${id}`);
  }

  getPaged(page: number, pageSize: number): Observable<{
    items: Neighborhood[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>{
    const params = new HttpParams().set('page', String(page)). set('pageSize', String(pageSize));
    return this.http.get<{items: Neighborhood[];
                          page: number;
                          pageSize: number;
                          totalItems: number;
                          totalPages: number;
    }>(this.apiUrl, { params });
  }

  searchByFilter(
    idCommune: number, 
    page?: number, 
    pageSize?: number
  ): Observable<Neighborhood[] | PagedResponse<Neighborhood>> {
    
    const filterUrl = `${this.apiUrl}/search`;
    
    // Inicializamos los parámetros con el ID del barrio obligado
    let params = new HttpParams().set('id_commune', idCommune.toString());

    // Agregamos los parámetros de paginación solo si existen
    if (page !== undefined && page !== null) {
      params = params.set('page', page.toString());
    }
    if (pageSize !== undefined && pageSize !== null) {
      params = params.set('pageSize', pageSize.toString());
    }

    // Retornamos la petición con el tipo flexible
    return this.http.get<Neighborhood[] | PagedResponse<Neighborhood>>(filterUrl, { params });
  }

  create(neighborhood: Omit<Neighborhood, 'id_neighborhood'>): Observable<Neighborhood>{
    return this.http.post<Neighborhood>(this.apiUrl, neighborhood)
  }

  update(id: number, neighborhood: Neighborhood): Observable<Neighborhood>{
    return this.http.put<Neighborhood>(`${this.apiUrl}/${id}`, neighborhood);
  }

  delete(id: number): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}