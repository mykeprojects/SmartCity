import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MapComponent } from 'src/app/components/map/map/map.component';
import { AnnotationForm } from 'src/app/components/annotations/annotation-form/annotation-form.component';
import { AnnotationForDisplay } from 'src/app/models/annotations/annotationForDisplay';
import { Annotation } from 'src/app/models/territorial/annotation';
import { AnnotationDisplayMapper } from 'src/app/services/annotations/annotation-display.mapper';
import { showSuccess } from 'src/app/services/territorial/ui-feedback.util';
import { VoteFormComponent } from 'src/app/components/votes/vote-form/vote-form.component';
import { CategoryFilterComponent } from 'src/app/components/annotations/category-filter/category-filter.component';
import { NeighborhoodPolygon } from 'src/app/models/territorial/neighborhoodPolygon';

@Component({
  selector: 'app-map-annotations',
  imports: [MapComponent, AnnotationForm, VoteFormComponent, CategoryFilterComponent],
  templateUrl: './map-annotations.html',
  styleUrl: './map-annotations.scss',
  standalone: true,
})
export class MapAnnotationsViewer {
  selectedPointCoordinates: [number, number] | null = null;
  selectedAnnotation: AnnotationForDisplay | null = null;
  mapRefreshTrigger = 0;
  selectedCategories: number[] = [];
  currentNeighborhood: NeighborhoodPolygon | null = null;
  selectedNeighborhood: number | null = null;
  selectedCommune: number | null = null;

  private readonly destroyRef = inject(DestroyRef);

  constructor(private annotationDisplayMapper: AnnotationDisplayMapper) {}

  selectNewPoint(coords: [number, number] | null): void {
    this.selectedPointCoordinates = coords;
    this.selectedAnnotation = null;
  }

  selectNewAnnotation(newAnnotation: Annotation | null): void {
    if (!newAnnotation) {
      return;
    }

    this.selectedPointCoordinates = null;
    this.annotationDisplayMapper
      .toDisplay(newAnnotation)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (display) => (this.selectedAnnotation = display),
      });
  }

  handleSubmit(newAnnotation: Annotation | null): void {
    this.selectNewAnnotation(newAnnotation);
    this.mapRefreshTrigger++;
    if (newAnnotation){
      showSuccess('Nueva anotación creada con éxito');
    }
    else {
      showSuccess('La anotación fue eliminada con éxito');
    }
  }

  handleFilterChange(categories: number[]): void {
    this.selectedCategories = categories;
  }

  handleNewNeighborhood(newNeighborhood: NeighborhoodPolygon | null): void {
    this.currentNeighborhood = newNeighborhood;
  }

  handleSelectedNeighborhood(newSelectedNeighborhood: number | null): void {
    this.selectedNeighborhood = newSelectedNeighborhood;
  }

  handleSelectedCommune(newSelectedCommune: number | null): void {
    this.selectedCommune = newSelectedCommune;
  }
}
