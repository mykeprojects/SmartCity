import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { DeleteCheckResult } from 'src/app/models/territorial/delete-check-result';
import { OfficialService } from './official.service';
import { InterestedPartyService } from './interested-party.service';
import { AnnotationService } from './annotation.service';
import { CategoryService } from './category.service';
import { AnnotationCategoryService } from './annotation-category.service';
import { NeighborhoodService } from './neighborhood.service';

@Injectable({ providedIn: 'root' })
export class DeleteValidationService {
  constructor(
    private officialService: OfficialService,
    private interestedPartyService: InterestedPartyService,
    private annotationService: AnnotationService,
    private categoryService: CategoryService,
    private annotationCategoryService: AnnotationCategoryService,
    private neighborhoodService: NeighborhoodService
  ) {}

  checkEntityDeletion(entityId: number): Observable<DeleteCheckResult> {
    return forkJoin({
      officials: this.officialService.search(1, 1, { id_entity: String(entityId) }),
      interestedParties: this.interestedPartyService.search(1, 1, { id_entity: String(entityId) }),
    }).pipe(
      map(({ officials, interestedParties }) => {
        const blockers: string[] = [];
        const officialCount = officials.totalItems ?? 0;
        const interestedCount = interestedParties.totalItems ?? 0;

        if (officialCount > 0) {
          blockers.push(`${officialCount} funcionario(s) asociado(s)`);
        }
        if (interestedCount > 0) {
          blockers.push(`${interestedCount} registro(s) de interesados en anotaciones`);
        }

        return { canDelete: blockers.length === 0, blockers };
      }),
      catchError(() =>
        of({
          canDelete: false,
          blockers: ['No se pudieron verificar las dependencias de la entidad.'],
        })
      )
    );
  }

  /**
   * CU-02 E3: no eliminar si tiene anotaciones o demarcaciones asociadas.
   * El modelo actual del backend no expone id_official en annotations ni points,
   * por lo que no es posible validar esas dependencias vía API.
   */
  checkOfficialDeletion(): Observable<DeleteCheckResult> {
    return of({ canDelete: true, blockers: [] });
  }

  checkCategoryDeletion(categoryId: number): Observable<DeleteCheckResult> {
    return forkJoin({
      subcategories: this.categoryService.search(1, 1, {
        id_parent_category: String(categoryId),
      }),
      annotationLinks: this.annotationCategoryService.search(1, 1, {
        id_category: String(categoryId),
      }),
    }).pipe(
      map(({ subcategories, annotationLinks }) => {
        const blockers: string[] = [];
        const subCount = subcategories.totalItems ?? 0;
        const annotationCount = annotationLinks.totalItems ?? 0;

        if (subCount > 0) {
          blockers.push(`${subCount} subcategoría(s) asociada(s)`);
        }
        if (annotationCount > 0) {
          blockers.push(`${annotationCount} anotación(es) vinculada(s)`);
        }

        return { canDelete: blockers.length === 0, blockers };
      }),
      catchError(() =>
        of({
          canDelete: false,
          blockers: ['No se pudieron verificar las dependencias de la categoría.'],
        })
      )
    );
  }

  checkCommuneDeletion(communeId: number): Observable<DeleteCheckResult> {
    return this.neighborhoodService.search(1, 500, { id_commune: String(communeId) }).pipe(
      map((resp) => {
        const neighborhoods = resp.items ?? [];
        if (neighborhoods.length === 0) {
          return { canDelete: true, blockers: [] };
        }

        const blockers = [
          `La comuna tiene ${neighborhoods.length} barrio(s) asociado(s):`,
          ...neighborhoods.map((neighborhood) => neighborhood.name),
        ];
        return { canDelete: false, blockers };
      }),
      catchError(() =>
        of({
          canDelete: false,
          blockers: ['No se pudieron verificar las dependencias de la comuna.'],
        })
      )
    );
  }

  checkCitizenDeletion(citizenId: number): Observable<DeleteCheckResult> {
    return this.annotationService.search(1, 1, { id_citizen: String(citizenId) }).pipe(
      map((resp) => {
        const annotationCount = resp.totalItems ?? 0;
        const blockers =
          annotationCount > 0 ? [`${annotationCount} anotación(es) asociada(s)`] : [];
        return { canDelete: blockers.length === 0, blockers };
      }),
      catchError(() =>
        of({
          canDelete: false,
          blockers: ['No se pudieron verificar las dependencias del ciudadano.'],
        })
      )
    );
  }
}
