import { Annotation } from "src/app/models/annotations/annotation";
import { environment } from 'src/environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs";
import { Injectable } from '@angular/core';
import { PagedResponse } from "src/app/models/territorial/paged-response";
import { buildPagedParams } from "../territorial/territorial-api.util";
@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
    private readonly apiUrl = `${environment.apiUrl}/api/annotations`;

    constructor(private http: HttpClient) {}

    getAnnotations(): Observable<Annotation[]> {
        return this.http.get<Annotation[]>(this.apiUrl);
    }

    getAnnotationById(id: number): Observable<Annotation>{
        return this.http.get<Annotation>(`${this.apiUrl}/${id}`);
    }

    createAnnotation(annotation: Partial<Annotation>){
        return this.http.post<Annotation>(this.apiUrl,annotation);
    }

    updateAnnotation(annotation: Annotation){
        const payload: Partial<Annotation> = {
            id_neighborhood: annotation.id_neighborhood,
            id_citizen: annotation.id_citizen,
            description: annotation.description,
            latitude: annotation.latitude,
            longitude: annotation.longitude,
            status: annotation.status,
        }
        return this.http.put<Partial<Annotation>>(`${this.apiUrl}/${annotation.id_annotation}`,payload);
    }

    deleteAnnotation(annotation: Annotation){
        return this.http.delete<Annotation>(`${this.apiUrl}/${annotation.id_annotation}`);
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
    search(page: number, pageSize: number,filters: Record<string, string>): Observable<PagedResponse<Annotation>> {
        return this.http.get<PagedResponse<Annotation>>(`${this.apiUrl}/search`, {
        params: buildPagedParams(page, pageSize, filters),
        });
    }

}