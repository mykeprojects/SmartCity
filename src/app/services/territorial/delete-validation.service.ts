import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { OfficialService } from './official.service';
import { InterestedPartyService } from './interested-party.service';

export interface DeleteCheckResult {
  canDelete: boolean;
  blockers: string[];
}

@Injectable({ providedIn: 'root' })
export class DeleteValidationService {
  constructor(
    private officialService: OfficialService,
    private interestedPartyService: InterestedPartyService
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
}
