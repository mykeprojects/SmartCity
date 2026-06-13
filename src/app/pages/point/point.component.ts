import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MapLocation, MapMarker, PointMapComponent } from 'src/app/pages/point-map/point-map.component';
import { Neighborhood } from 'src/app/models/territorial/neighborhood';
import { Point } from 'src/app/models/territorial/point';
import { NeighborhoodService } from 'src/app/services/territorial/neighborhood.service';
import { PointService } from 'src/app/services/territorial/point.service';

type EditingTool = 'select' | 'add' | 'move' | 'delete';

@Component({
  selector: 'app-point-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PointMapComponent],
  templateUrl: './point.component.html',
  styleUrl: './point.component.scss',
})
export class PointComponent implements OnInit {
  searchTerm = '';
  neighborhoods: Neighborhood[] = [];
  selectedNeighborhood: Neighborhood | null = null;
  points: Point[] = [];
  selectedPointId: number | null = null;
  activeTool: EditingTool = 'add';
  loadingNeighborhoods = false;
  loadingPoints = false;
  savingPoint = false;
  feedback = '';
  feedbackTone: 'success' | 'error' | 'info' = 'info';
  draftLatitude: number | null = null;
  draftLongitude: number | null = null;
  draftPointType = 'boundary';
  draftOrder: number | null = null;
  mapCenter: [number, number] = [5.0703, -75.5138];

  constructor(
    private neighborhoodService: NeighborhoodService,
    private pointService: PointService
  ) {}

  ngOnInit(): void {
    this.searchNeighborhoods();
  }

  get selectedPoint(): Point | null {
    return this.points.find((point) => point.id_point === this.selectedPointId) ?? null;
  }

  get orderedPoints(): Point[] {
    return [...this.points].sort((left, right) => this.comparePoints(left, right));
  }

  get pointMarkers(): MapMarker[] {
    return this.orderedPoints
      .filter((point) => this.hasCoordinates(point))
      .map((point, index) => ({
        id: point.id_point!,
        latitude: point.latitude!,
        longitude: point.longitude!,
        order: point.order ?? index + 1,
        label: String(point.order ?? index + 1),
        selected: point.id_point === this.selectedPointId,
      }));
  }

  get polygonPoints(): MapLocation[] {
    return this.pointMarkers.map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));
  }

  searchNeighborhoods(): void {
    this.loadingNeighborhoods = true;
    this.feedback = '';

    const filters: Record<string, string> = {};
    if (this.searchTerm.trim()) {
      filters['name'] = this.searchTerm.trim();
    }

    this.neighborhoodService
      .search(1, 20, filters)
      .pipe(finalize(() => (this.loadingNeighborhoods = false)))
      .subscribe({
        next: (response) => {
          this.neighborhoods = response.items ?? [];

          if (!this.selectedNeighborhood && this.neighborhoods.length > 0) {
            this.selectNeighborhood(this.neighborhoods[0]);
          }

          if (this.neighborhoods.length === 0) {
            this.showFeedback('No se encontraron barrios con ese criterio.', 'info');
          }
        },
        error: () => this.showFeedback('No fue posible cargar los barrios.', 'error'),
      });
  }

  selectNeighborhood(neighborhood: Neighborhood): void {
    this.selectedNeighborhood = neighborhood;
    this.activeTool = 'select';
    this.selectedPointId = null;
    this.points = [];
    this.showFeedback(`Cargando puntos de ${neighborhood.name}...`, 'info');

    if (!neighborhood.id_neighborhood) {
      this.showFeedback('El barrio seleccionado no tiene identificador.', 'error');
      return;
    }

    this.loadingPoints = true;
    this.pointService
      .searchByFilter(neighborhood.id_neighborhood)
      .pipe(finalize(() => (this.loadingPoints = false)))
      .subscribe({
        next: (response) => {
          this.points = this.normalizePoints(response);
          this.selectedPointId = this.points[0]?.id_point ?? null;
          this.syncDraftFromSelection();
          this.refreshMapCenter();
          this.showFeedback(
            `${this.points.length} punto(s) cargado(s) para ${neighborhood.name}.`,
            'success'
          );
        },
        error: () => this.showFeedback('No fue posible cargar los puntos del barrio.', 'error'),
      });
  }

  selectPoint(point: Point): void {
    this.selectedPointId = point.id_point ?? null;
    this.syncDraftFromSelection();
  }

  onMapClick(location: MapLocation): void {
    if (!this.selectedNeighborhood?.id_neighborhood) {
      return;
    }

    if (this.activeTool === 'select') {
      return;
    }

    if (this.activeTool === 'move') {
      const point = this.selectedPoint;
      if (!point?.id_point) {
        this.showFeedback('Selecciona un punto antes de moverlo.', 'info');
        return;
      }

      const movedPoint: Point = {
        ...point,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      this.persistPoint(movedPoint, 'Punto movido correctamente.');
      return;
    }

    if (this.activeTool !== 'add') {
      return;
    }

    this.createPoint(location.latitude, location.longitude);
  }

  onMarkerSelected(pointId: number | string): void {
    if (typeof pointId !== 'number') return;

    const point = this.points.find((item) => item.id_point === pointId);
    if (!point) return;

    if (this.activeTool === 'delete') {
      this.selectedPointId = point.id_point ?? null;
      this.deleteSelectedPoint();
      return;
    }

    this.selectPoint(point);
  }

  onMarkerMoved(event: { id: number | string; location: MapLocation }): void {
    if (this.activeTool === 'delete' || typeof event.id !== 'number') return;

    const point = this.points.find((item) => item.id_point === event.id);
    if (!point || !point.id_point) return;

    const updatedPoint: Point = {
      ...point,
      latitude: event.location.latitude,
      longitude: event.location.longitude,
    };

    this.persistPoint(updatedPoint, 'Punto actualizado desde el mapa.');
  }

  saveSelectedPoint(): void {
    const point = this.selectedPoint;
    if (!point || !point.id_point) return;

    const updatedPoint: Point = {
      ...point,
      latitude: this.draftLatitude ?? point.latitude,
      longitude: this.draftLongitude ?? point.longitude,
      order: this.draftOrder ?? point.order,
      point_type: this.draftPointType,
      id_neighborhood: this.selectedNeighborhood?.id_neighborhood ?? point.id_neighborhood,
    };

    this.persistPoint(updatedPoint, 'Cambios guardados correctamente.');
  }

  deleteSelectedPoint(): void {
    const point = this.selectedPoint;
    if (!point?.id_point) return;

    this.savingPoint = true;
    this.pointService
      .delete(point.id_point)
      .pipe(finalize(() => (this.savingPoint = false)))
      .subscribe({
        next: () => {
          this.points = this.points.filter((item) => item.id_point !== point.id_point);
          this.selectedPointId = this.points[0]?.id_point ?? null;
          this.syncDraftFromSelection();
          this.refreshMapCenter();
          this.showFeedback('Punto eliminado correctamente.', 'success');
        },
        error: () => this.showFeedback('No fue posible eliminar el punto.', 'error'),
      });
  }

  trackByNeighborhood(_index: number, neighborhood: Neighborhood): number | undefined {
    return neighborhood.id_neighborhood;
  }

  trackByPoint(_index: number, point: Point): number | undefined {
    return point.id_point;
  }

  syncDraftFromSelection(): void {
    const point = this.selectedPoint;
    this.draftLatitude = point?.latitude ?? null;
    this.draftLongitude = point?.longitude ?? null;
    this.draftPointType = point?.point_type ?? 'boundary';
    this.draftOrder = point?.order ?? null;
  }

  private createPoint(latitude: number, longitude: number): void {
    if (!this.selectedNeighborhood?.id_neighborhood) return;

    this.savingPoint = true;

    const payload: Omit<Point, 'id_point'> = {
      id_neighborhood: this.selectedNeighborhood.id_neighborhood,
      latitude,
      longitude,
      order: this.nextOrder(),
      point_type: this.draftPointType,
    };

    this.pointService
      .create(payload)
      .pipe(finalize(() => (this.savingPoint = false)))
      .subscribe({
        next: (createdPoint) => {
          this.points = [...this.points, createdPoint];
          this.selectedPointId = createdPoint.id_point ?? null;
          this.syncDraftFromSelection();
          this.refreshMapCenter();
          this.showFeedback('Punto agregado al polígono.', 'success');
        },
        error: () => this.showFeedback('No fue posible crear el punto.', 'error'),
      });
  }

  private persistPoint(point: Point, successMessage: string): void {
    if (!point.id_point) return;

    this.savingPoint = true;
    this.pointService
      .update(point.id_point, point)
      .pipe(finalize(() => (this.savingPoint = false)))
      .subscribe({
        next: (updatedPoint) => {
          this.points = this.points.map((item) =>
            item.id_point === updatedPoint.id_point ? updatedPoint : item
          );
          this.selectedPointId = updatedPoint.id_point ?? null;
          this.syncDraftFromSelection();
          this.refreshMapCenter();
          this.showFeedback(successMessage, 'success');
        },
        error: () => this.showFeedback('No fue posible actualizar el punto.', 'error'),
      });
  }

  private refreshMapCenter(): void {
    const focusPoint = this.selectedPoint ?? this.orderedPoints[0];
    if (focusPoint?.latitude != null && focusPoint.longitude != null) {
      this.mapCenter = [focusPoint.latitude, focusPoint.longitude];
    }
  }

  private normalizePoints(response: Point[] | { items: Point[] }): Point[] {
    if (Array.isArray(response)) {
      return response.filter((point) => this.hasCoordinates(point)).sort((left, right) => this.comparePoints(left, right));
    }

    return (response.items ?? [])
      .filter((point) => this.hasCoordinates(point))
      .sort((left, right) => this.comparePoints(left, right));
  }

  private hasCoordinates(point: Point): boolean {
    return point.latitude != null && point.longitude != null;
  }

  private comparePoints(left: Point, right: Point): number {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;

    const leftId = left.id_point ?? Number.MAX_SAFE_INTEGER;
    const rightId = right.id_point ?? Number.MAX_SAFE_INTEGER;
    return leftId - rightId;
  }

  private nextOrder(): number {
    const maxOrder = this.points.reduce((max, point) => Math.max(max, point.order ?? 0), 0);
    return maxOrder + 1;
  }

  private showFeedback(message: string, tone: 'success' | 'error' | 'info'): void {
    this.feedback = message;
    this.feedbackTone = tone;
  }
}