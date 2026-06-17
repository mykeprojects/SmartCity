import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Annotation } from 'src/app/models/territorial/annotation';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './api.util';
import { AnnotationCategoryService } from './annotation-category.service';
import { EvidenceService } from './evidence.service';
import { InterestedPartyService } from './interested-party.service';
import { VoteService } from './vote.service';
import { switchMap, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  private readonly apiUrl = `${environment.apiUrl}/api/annotations`;

  constructor(private http: HttpClient, private annotationCategoryService: AnnotationCategoryService, 
    private evidenceService: EvidenceService, private interestedPartyService: InterestedPartyService, private voteService: VoteService) {}

  getAll(): Observable<Annotation[]> {
    return this.http.get<Annotation[]>(this.apiUrl);
  }

  /** @deprecated Use getAll() */
  getAnnotations(): Observable<Annotation[]> {
    return this.getAll();
  }

  getById(id: number): Observable<Annotation> {
    return this.http.get<Annotation>(`${this.apiUrl}/${id}`);
  }

  /** @deprecated Use getById() */
  getAnnotationById(id: number): Observable<Annotation> {
    return this.getById(id);
  }

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<Annotation>> {
    return this.http.get<PagedResponse<Annotation>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  searchFilter(filters: Record<string, string | number>): Observable<Annotation[]> {
    const params = Object.keys(filters).reduce((httpParams, key) => {
      const value = filters[key];
      return value !== undefined && value !== null
        ? httpParams.set(key, value.toString())
        : httpParams;
    }, new HttpParams());

    return this.http.get<Annotation[]>(`${this.apiUrl}/search`, { params });
  }

  create(annotation: Partial<Annotation>): Observable<Annotation> {
    return this.http.post<Annotation>(this.apiUrl, annotation);
  }

  /** @deprecated Use create() */
  createAnnotation(annotation: Partial<Annotation>): Observable<Annotation> {
    return this.create(annotation);
  }

  update(id: number, annotation: Partial<Annotation>): Observable<Annotation> {
    return this.http.put<Annotation>(`${this.apiUrl}/${id}`, annotation);
  }

  /** @deprecated Use update() */
  updateAnnotation(annotation: Annotation): Observable<Annotation> {
    const payload: Partial<Annotation> = {
      id_neighborhood: annotation.id_neighborhood,
      id_citizen: annotation.id_citizen,
      description: annotation.description,
      latitude: annotation.latitude,
      longitude: annotation.longitude,
      status: annotation.status,
    };
    return this.update(annotation.id_annotation!, payload);
  }

  delete(id: number): Observable<void> {
    return forkJoin({
      annotationCategories: this.annotationCategoryService.getAll(),
      annotationInterestedParties: this.interestedPartyService.getAnnotationParties(id),
      annotationEvidences: this.evidenceService.getEvidencesByAnnotationId(id),
      annotationVotes: this.voteService.getAnnotationVotes(id),
    }).pipe(
      switchMap(result => {

        const deletes: Observable<any>[] = [];

        deletes.push(this.http.delete(`${this.apiUrl}/${id}`));

        const categories = result.annotationCategories.filter(ac => ac.id_annotation === id);
        categories.forEach(c =>
          deletes.push(this.annotationCategoryService.delete(c.id_annotation_category as number))
        );

        result.annotationInterestedParties.forEach(p =>
          deletes.push(this.interestedPartyService.delete(p.id_interested_party as number))
        );

        if (result.annotationEvidences){
          result.annotationEvidences.forEach(e =>
            deletes.push(this.evidenceService.delete(e.id_evidence as number))
          );
        }

        result.annotationVotes.forEach(v =>
          deletes.push(this.voteService.delete(v.id_vote as number))
        );

        return forkJoin(deletes);
      }),
      map(() => void 0)
    );
  }
}
