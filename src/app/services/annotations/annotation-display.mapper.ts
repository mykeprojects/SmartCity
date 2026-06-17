import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Annotation } from 'src/app/models/territorial/annotation';
import { AnnotationForDisplay } from 'src/app/models/annotations/annotationForDisplay';
import { CitizenService } from '../territorial/citizen.service';
import { NeighborhoodService } from '../territorial/neighborhood.service';
import { AnnotationCategoryService } from '../territorial/annotation-category.service';
import { InterestedPartyService } from '../territorial/interested-party.service';
import { EvidenceService } from '../territorial/evidence.service';
import { InterestedParty } from 'src/app/models/territorial/interested-party';

@Injectable({ providedIn: 'root' })
export class AnnotationDisplayMapper {
  constructor(
    private citizenService: CitizenService,
    private neighborhoodService: NeighborhoodService,
    private annotationCategoryService: AnnotationCategoryService,
    private interestedPartyService: InterestedPartyService,
    private evidenceService: EvidenceService
  ) {}

  toDisplay(annotation: Annotation): Observable<AnnotationForDisplay> {
    const id = annotation.id_annotation;
    if (!id || !annotation.id_citizen) {
      return of(this.buildBaseDisplay(annotation, 'Desconocido', 'Sin barrio'));
    }

    return forkJoin({
      citizen: this.citizenService.getById(annotation.id_citizen).pipe(catchError(() => of(null))),
      category: this.annotationCategoryService
        .getAnnotationCategoryByAnnotationId(id)
        .pipe(catchError(() => of(null))),
      parties: this.interestedPartyService
        .getAnnotationParties(id)
        .pipe(catchError(() => of([]))),
      evidences: this.evidenceService
        .getEvidencesByAnnotationId(id)
        .pipe(catchError(() => of([]))),
      neighborhood: annotation.id_neighborhood
        ? this.neighborhoodService.getById(annotation.id_neighborhood).pipe(catchError(() => of(null)))
        : of(null),
    }).pipe(
      map(({ citizen, category, parties, evidences, neighborhood }) => {
        const isSubCategory = category?.id_parent_category != null;
        const displayCategoryId = category
          ? (category.id_parent_category ?? category.id_category ?? undefined)
          : undefined;

        const display = this.buildBaseDisplay(
          annotation,
          citizen?.name ?? 'Desconocido',
          neighborhood?.name ?? 'Sin barrio'
        );
        display.category = displayCategoryId;
        if (isSubCategory && category) {
          display.subCategory = category.id_category ?? undefined;
        }
        display.interestedParties = parties.map((party: InterestedParty) => party.id_entity);
        display.evidences = evidences ?? [];
        return display;
      })
    );
  }

  private buildBaseDisplay(
    annotation: Annotation,
    citizenName: string,
    neighborhoodName: string
  ): AnnotationForDisplay {
    const registrationDate = annotation.registration_date
      ? new Date(annotation.registration_date).toLocaleString('es-CO')
      : '-';

    return {
      description: annotation.description,
      id_annotation: annotation.id_annotation ?? 0,
      citizen_name: citizenName,
      id_citizen: annotation.id_citizen,
      neighborhood_name: neighborhoodName,
      latitude: annotation.latitude,
      longitude: annotation.longitude,
      registration_date: registrationDate,
      status: annotation.status,
    };
  }
}
