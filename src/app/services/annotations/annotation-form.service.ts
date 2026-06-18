import { Injectable } from '@angular/core';
import { forkJoin, switchMap } from 'rxjs';
import { Annotation } from 'src/app/models/territorial/annotation';
import { AnnotationForDisplay } from 'src/app/models/annotations/annotationForDisplay';
import { AnnotationCategory } from 'src/app/models/territorial/annotation-category';
import { InterestedParty } from 'src/app/models/territorial/interested-party';
import { Evidence } from 'src/app/models/territorial/evidence';
import { NeighborhoodPolygon } from 'src/app/models/territorial/neighborhoodPolygon';
import { AnnotationService } from 'src/app/services/territorial/annotation.service';
import { AnnotationCategoryService } from 'src/app/services/territorial/annotation-category.service';
import { InterestedPartyService } from 'src/app/services/territorial/interested-party.service';
import { EvidenceService } from 'src/app/services/territorial/evidence.service';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AnnotationFormService {

  constructor(
    private annotationService: AnnotationService,
    private annotationCategoryService: AnnotationCategoryService,
    private interestedPartyService: InterestedPartyService,
    private evidenceService: EvidenceService,
  ) {}

  submitAnnotation(
    annotation: Partial<Annotation>,
    categoryId: number | undefined,
    entities: number[],
    files: File[],
    onSuccess: (newAnnotation: Annotation) => void
  ) {
    this.annotationService.createAnnotation(annotation).subscribe(newAnnotation => {
      const saveTasks = [];

      if (!categoryId) {
        Swal.fire({ title: 'Error', text: 'Debe seleccionar una categoría', icon: 'error' });
        return;
      }

      if (categoryId && newAnnotation.id_annotation) {
        const annotationCategory: AnnotationCategory = {
          id_annotation: newAnnotation.id_annotation,
          id_category: categoryId,
        };
        saveTasks.push(this.annotationCategoryService.create(annotationCategory));
      }

      entities.forEach(entity => {
        if (!newAnnotation.id_annotation) return;
        const link: Partial<InterestedParty> = {
          id_annotation: newAnnotation.id_annotation,
          id_entity: entity,
        };
        saveTasks.push(this.interestedPartyService.create(link));
      });

      files.forEach(file => {
        if (!newAnnotation.id_annotation) return;
        const evidence: Partial<Evidence> = {
          id_annotation: newAnnotation.id_annotation,
          file_type: file.type,
          file_size: file.size,
        };
        saveTasks.push(this.evidenceService.create(evidence, file));
      });

      if (saveTasks.length > 0) {
        forkJoin(saveTasks).subscribe(() => onSuccess(newAnnotation));
      } else {
        onSuccess(newAnnotation);
      }
    });
  }

  submitEditedAnnotation(
    annotation: AnnotationForDisplay,
    updatedAnnotation: Annotation,
    categoryId: number | undefined,
    entities: number[],
    onSuccess: (result: Annotation) => void
  ) {
    forkJoin({
      annotationCategories: this.annotationCategoryService.getAll(),
      currentInterestedPartes: this.interestedPartyService.getAnnotationParties(annotation.id_annotation),
    }).subscribe(result => {
      this.updateInterestedParties(annotation.id_annotation, entities);

      const currentAnnotationCategory = result.annotationCategories
        .find(ac => ac.id_annotation === annotation.id_annotation);

      const hasValidCategory = categoryId !== undefined && !Number.isNaN(categoryId);

      if (hasValidCategory && currentAnnotationCategory) {
        const updatedCategory = { ...currentAnnotationCategory, id_category: categoryId };
        forkJoin({
          updatedAnnotation: this.annotationService.update(annotation.id_annotation, updatedAnnotation),
          updatedAnnotationCategory: this.annotationCategoryService.update(updatedCategory),
        }).subscribe(res => onSuccess(res.updatedAnnotation));

      } else if (hasValidCategory && !currentAnnotationCategory) {
        const annotationCategory: AnnotationCategory = {
          id_annotation: annotation.id_annotation,
          id_category: categoryId!,
        };
        forkJoin({
          updatedAnnotation: this.annotationService.update(annotation.id_annotation, updatedAnnotation),
          createdAnnotationCategory: this.annotationCategoryService.create(annotationCategory),
        }).subscribe(res => onSuccess(res.updatedAnnotation));

      } else {
        this.annotationService.update(annotation.id_annotation, updatedAnnotation)
          .subscribe(newAnnotation => onSuccess(newAnnotation));
      }
    });
  }

  updateInterestedParties(annotationId: number, entities: number[]) {
    this.interestedPartyService.getAnnotationParties(annotationId).pipe(
      switchMap(interestedParties => {
        const createRequests = entities.map(entity => {
          const link: Partial<InterestedParty> = { id_annotation: annotationId, id_entity: entity };
          return this.interestedPartyService.create(link);
        });
        const deleteRequests = interestedParties.map(old =>
          this.interestedPartyService.delete(old.id_interested_party!)
        );
        return forkJoin([...createRequests, ...deleteRequests]);
      })
    ).subscribe();
  }
}