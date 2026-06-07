import { HttpParams } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
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

export function showImagePreview(imageUrl: string, title = 'Vista previa'): void {
  if (!imageUrl) return;
  Swal.fire({
    title,
    imageUrl,
    imageAlt: title,
    showConfirmButton: false,
    showCloseButton: true,
    width: 'auto',
    padding: '1rem',
    customClass: {
      image: 'max-h-[70vh] object-contain',
    },
  });
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

export function showDeleteBlocked(title: string, blockers: string[]): void {
  const items = blockers.map((item) => `<li>${item}</li>`).join('');
  Swal.fire({
    title,
    html: `<p class="mb-2">No se puede eliminar porque tiene dependencias asociadas:</p><ul class="text-left list-disc pl-5">${items}</ul>`,
    icon: 'error',
  });
}

export function officialHasEntity(official: { id_entity?: number | null }): boolean {
  return official.id_entity != null && official.id_entity > 0;
}

export const OFFICIAL_ROLES = [
  { value: 'official', label: 'Funcionario' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'admin', label: 'Administrador' },
] as const;

export function formatOfficialRole(role?: string | null): string {
  if (!role) return '-';
  return OFFICIAL_ROLES.find((r) => r.value === role)?.label ?? role;
}

export function appendFormField(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null || value === '') {
    return;
  }
  formData.append(key, String(value));
}
