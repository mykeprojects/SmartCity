import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Evidence } from 'src/app/models/territorial/evidence';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EvidenceService {
  private readonly apiUrl = `${environment.apiUrl}/api/evidences`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Evidence[]>{
    return this.http.get<Evidence[]>(`${this.apiUrl}`);
  }

  search(page: number, pageSize: number,filters: Record<string, string>): Observable<PagedResponse<Evidence>> {
    return this.http.get<PagedResponse<Evidence>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  create(annotation: Partial<Evidence>, file?: File): Observable<Evidence>{
    const formData = new FormData();
    if (annotation.id_annotation !== undefined) {
      formData.append('id_annotation', annotation.id_annotation.toString());
    }
    if (annotation.file_type) {
      formData.append('file_type', annotation.file_type);
    }
    if (annotation.file_size !== undefined) {
      formData.append('file_size', annotation.file_size.toString());
    }
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<Evidence>(`${this.apiUrl}`, formData);
  }

    getEvidencesByAnnotationId(annotationId: number): Observable<Evidence[] | null> {
    return this.getAll().pipe(
        map(evidences => {
        const filtered = evidences.filter(
            ev => Number(ev.id_annotation) === Number(annotationId)
        );

        return filtered.length > 0 ? filtered : null;
        })
    );
    }
}
