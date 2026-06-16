import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

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

export function extractFirebaseErrorMessage(
  error: unknown,
  fallback = 'No se pudo crear la cuenta de acceso.'
): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code);
    switch (code) {
      case 'auth/email-already-in-use':
        return 'El correo ya está registrado en Firebase.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
    }
  }
  return fallback;
}
