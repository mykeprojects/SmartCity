import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Point } from 'src/app/models/territorial/point';
import { environment } from 'src/environments/environments';
import { Observable } from 'rxjs';
import { PagedResponse } from 'src/app/models/territorial/paged-response';

@Injectable({
  providedIn: 'root',
})
export class PointService {
  
  private readonly apiUrl = `${environment.apiUrl}/api/points`;
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Point[]> {
    return this.http.get<Point[]>(this.apiUrl);
  }

  getPaged(page: number, pageSize: number): Observable<{
    items: Point[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<{
      items: Point[];
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    }>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Point> {
    return this.http.get<Point>(`${this.apiUrl}/${id}`);
  }

  searchByFilter(
    idNeighborhood: number, 
    page?: number, 
    pageSize?: number
  ): Observable<Point[] | PagedResponse<Point>> {
    
    const filterUrl = `${this.apiUrl}/search`;
    
    // Inicializamos los parámetros con el ID del barrio obligado
    let params = new HttpParams().set('id_neighborhood', idNeighborhood.toString());

    // Agregamos los parámetros de paginación solo si existen
    if (page !== undefined && page !== null) {
      params = params.set('page', page.toString());
    }
    if (pageSize !== undefined && pageSize !== null) {
      params = params.set('pageSize', pageSize.toString());
    }

    // Retornamos la petición con el tipo flexible
    return this.http.get<Point[] | PagedResponse<Point>>(filterUrl, { params });
  }

  create(point: Omit<Point, 'id_point'>): Observable<Point> {
    return this.http.post<Point>(this.apiUrl, point);
  }

  update(id: number, point: Point): Observable<Point> {
    return this.http.put<Point>(`${this.apiUrl}/${id}`, point);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
