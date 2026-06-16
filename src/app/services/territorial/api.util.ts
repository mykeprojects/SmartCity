import { HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environments';
import { PagedResponse } from 'src/app/models/territorial/paged-response';

export function territorialImageUrl(path?: string | null): string {
  if (!path?.trim()) {
    return '';
  }

  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  let relative = trimmed.replace(/^\/+/, '');
  if (relative.startsWith('api/images/')) {
    relative = relative.slice('api/images/'.length);
  }

  return `${environment.apiUrl}/api/images/${relative}`;
}

export function buildPagedParams(
  page: number,
  pageSize: number,
  extra?: Record<string, string>
): HttpParams {
  let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
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

export function appendFormField(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null || value === '') {
    return;
  }
  formData.append(key, String(value));
}
