import { Annotation } from "src/app/models/annotations/annotation";
import { environment } from 'src/environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
    private readonly apiUrl = `${environment.apiUrl}/annotations`;

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

}