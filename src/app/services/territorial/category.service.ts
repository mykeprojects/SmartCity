import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Category } from 'src/app/models/territorial/category';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { appendFormField, buildPagedParams } from './territorial-api.util';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/categories`;

  constructor(private http: HttpClient) {}

  getPaged(page: number, pageSize: number): Observable<PagedResponse<Category>> {
    return this.http.get<PagedResponse<Category>>(this.apiUrl, {
      params: buildPagedParams(page, pageSize),
    });
  }

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getParentCategories(): Observable<Category[]>{
    let categories$ = this.getAll().pipe(
      map(categories => categories.filter(c => !c.id_parent_category))
    );
    return categories$;
  }

  getChildCategories(id: number): Observable<Category[]>{
    let categories$ = this.getAll().pipe(
      map(categories => categories.filter(c => c.id_parent_category === id))
    );
    return categories$;
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<Category>> {
    return this.http.get<PagedResponse<Category>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }

  create(category: Partial<Category>, imageFile?: File): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, this.toFormData(category, imageFile));
  }

  update(id: number, category: Partial<Category>, imageFile?: File): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, this.toFormData(category, imageFile));
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  private toFormData(category: Partial<Category>, imageFile?: File): FormData {
    const formData = new FormData();
    appendFormField(formData, 'name', category.name);
    appendFormField(formData, 'description', category.description);
    appendFormField(formData, 'status', category.status);
    if (category.id_parent_category !== undefined && category.id_parent_category !== null) {
      appendFormField(formData, 'id_parent_category', category.id_parent_category);
    }
    if (imageFile) {
      formData.append('file', imageFile);
    }
    return formData;
  }
}
