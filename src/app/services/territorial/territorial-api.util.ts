import { HttpParams } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environments';
import { PagedResponse } from 'src/app/models/territorial/paged-response';

export function territorialImageUrl(path?: string | null): string {
  if (!path) {
    return '';
  }
  return `${environment.apiUrl}/api/images/${path}`;
}

export function buildPagedParams(page: number, pageSize: number, extra?: Record<string, string>): HttpParams {
  let params = new HttpParams()
    .set('page', String(page))
    .set('pageSize', String(pageSize));
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });
  }
  return params;
}

export function isPagedResponse<T>(value: unknown): value is PagedResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    Array.isArray((value as PagedResponse<T>).items)
  );
}

export function extractErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message;
    }
  }
  return fallback;
}

export function showApiError(error: unknown, fallback?: string): void {
  Swal.fire('Error', extractErrorMessage(error, fallback), 'error');
}

export function showSuccess(title: string, text?: string): void {
  Swal.fire(title, text, 'success');
}

export function appendFormField(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null || value === '') {
    return;
  }
  formData.append(key, String(value));
}
