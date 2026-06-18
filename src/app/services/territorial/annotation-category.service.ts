import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { AnnotationCategory } from 'src/app/models/territorial/annotation-category';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';
import { Category } from 'src/app/models/territorial/category';
import { CategoryService } from './category.service';
import { switchMap, of, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnnotationCategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/annotation-categories`;

  constructor(private http: HttpClient, private categoryService: CategoryService) {}

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<AnnotationCategory>> {
    return this.http.get<PagedResponse<AnnotationCategory>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  create(annotationCategory: Partial<AnnotationCategory>): Observable<AnnotationCategory>{
    return this.http.post<AnnotationCategory>(`${this.apiUrl}`,annotationCategory);
  }

  getAll(): Observable<AnnotationCategory[]>{
    return this.http.get<AnnotationCategory[]>(`${this.apiUrl}`);
  }

  getAnnotationCategoryByAnnotationId(id_annotation: number): Observable<Category | null> {
    return this.getAll().pipe(
      switchMap(annotationsCategories => {
        const found = annotationsCategories.find(ac => ac.id_annotation === id_annotation);

        if (!found) return of(null);

        // Ensure the stored id_category is a valid number before calling getById
        const catId = Number(found.id_category as any);
        if (!catId || Number.isNaN(catId)) {
          console.warn('AnnotationCategory has invalid id_category:', found);
          return of(null);
        }

        return this.categoryService.getById(catId).pipe(
          catchError(err => {
            console.error('Failed to fetch category by id', catId, err);
            // Return a minimal Category object with the id set so callers can still use the id
            return of({ id_category: catId, id_parent_category: undefined, name: '', status: '' } as Category);
          })
        );
      })
    );
  }

  delete(annotationCategoryId: number): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${annotationCategoryId}`);
  }

  update(updatedAnnotationCategory: AnnotationCategory): Observable<AnnotationCategory>{
    return this.http.put<AnnotationCategory>(`${this.apiUrl}/${updatedAnnotationCategory.id_annotation_category}`,updatedAnnotationCategory);
  }
}
