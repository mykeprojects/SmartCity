import { AfterViewInit, Component, ElementRef, Input, Output, OnDestroy, ViewChild, EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';
import { Annotation } from 'src/app/models/territorial/annotation';
import { AnnotationForMarker } from 'src/app/models/annotations/annotationForMarker';
import { AnnotationService } from 'src/app/services/territorial/annotation.service';
import * as L from 'leaflet';
import { CategoryService } from 'src/app/services/territorial/category.service';
import { Category } from 'src/app/models/territorial/category';
import { AnnotationCategoryService } from 'src/app/services/territorial/annotation-category.service';
import { AnnotationCategory } from 'src/app/models/territorial/annotation-category';
import { forkJoin } from 'rxjs';
import { isPointInPolygon, createMarkerIcon, isAnnotationNeighborhoodAllowed, getCustomIcon  } from 'src/app/services/territorial/annotations-map.util';
import { Point } from 'src/app/models/territorial/point';
import { PointService } from 'src/app/services/territorial/point.service';
import { NeighborhoodPolygon } from 'src/app/models/territorial/neighborhoodPolygon';
import { NeighborhoodService } from 'src/app/services/territorial/neighborhood.service';
import { Neighborhood } from 'src/app/models/territorial/neighborhood';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {

  constructor(private annotationService: AnnotationService, private categoryService: CategoryService, private annotationCategoryService: AnnotationCategoryService,
    private pointService: PointService, private neighborhoodService: NeighborhoodService,
  ){

  }
  @Input() center: [number, number] = [5.0703, -75.5138];
  @Input() zoom = 13;
  @Input() currentCategories?: number[];
  @Input() isAnnotationMode?: boolean;
  @Input() mapRefreshTrigger?: number;
  @Input() filterSelectedCommune?: number | null;
  @Input() filterSelectedNeighborhood?: number | null;
  @Output() newPoint = new EventEmitter<[number,number] | null>;
  @Output() selectedPoint = new EventEmitter<Annotation>;
  @Output() newNeighborhood = new EventEmitter<NeighborhoodPolygon | null>

  @ViewChild('mapContainer', { static: false })
  mapContainer!: ElementRef;

  private map!: L.Map;

  private annotations: AnnotationForMarker[] = [];

  private currentMarker: L.Marker;
  private currentPolygon: L.Polygon;

  private categories: Category[];
  private annotationCategories: AnnotationCategory[];
  private points: Record<string, Point[]>;
  private neighborhoods: Neighborhood[];

  ngAfterViewInit(): void {
    forkJoin({
      categories: this.categoryService.getAll(),
      annotationCategories: this.annotationCategoryService.getAll(),
      points: this.pointService.getAll(),
      neighborhoods: this.neighborhoodService.getAll(),
    }).subscribe(result => {
      this.categories = result.categories;
      this.annotationCategories = result.annotationCategories;
      this.neighborhoods = result.neighborhoods;
      const points = result.points.filter(point => point.point_type === "boundary")
      const grouped = points.reduce((acc, item) => {
        const key = item.id_neighborhood as number;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(item);

        return acc;
      }, {} as Record<string, Point[]>);
      this.points = grouped;

      this.initMap();
    });
  
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes['mapRefreshTrigger'] && this.map){
      this.fetchAnnotations();
    }

    if (this.map && (changes['currentCategories'] || changes['filterSelectedCommune'] || changes['filterSelectedNeighborhood'])){
      this.fetchAnnotations();
    }
  }

  private initMap(): void {

    // Destroy any existing map instance first
    if (this.map) {
      this.map.remove();
      this.map = null as any;
    }

    // Clear Leaflet's internal container flag to prevent
    // "Map container is already initialized" when navigating
    // between pages that both use <app-map>.
    const container = this.mapContainer.nativeElement as any;
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    this.map = L.map(container).setView(
      this.center,
      this.zoom
    );

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    if (this.isAnnotationMode){
      this.initializeAnnotationMode();
    }

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null as any;
    }
  }

  private initializeAnnotationMode(){
    this.fetchAnnotations();
    this.createAnnotationsListeners();
  }

  private fetchAnnotations(): void {
    forkJoin({
      annotations: this.annotationService.getAnnotations(),
      annotationCategories: this.annotationCategoryService.getAll()
    }).subscribe(({ annotations, annotationCategories }) => {

      this.annotationCategories = annotationCategories;

      const annotationToCategory = new Map<number, number>(
        annotationCategories.map(c => [c.id_annotation, c.id_category])
      );

      const allowedCategories = new Set<number>(this.currentCategories ?? []);

      this.annotations.forEach(a => a.active = false);

      annotations.forEach(annotationFetched => {
        if (!annotationFetched.id_annotation) {
          return;
        }

        const categoryId = annotationToCategory.get(annotationFetched.id_annotation);
        let isNeighborhoodAllowed = isAnnotationNeighborhoodAllowed(annotationFetched,this.neighborhoods,this.filterSelectedCommune,this.filterSelectedNeighborhood);

        const isAllowed = (isNeighborhoodAllowed && (allowedCategories.size === 0 || (categoryId !== undefined && allowedCategories.has(categoryId))));

        const found = this.annotations.find(annotationMarked =>
          annotationFetched.id_annotation === annotationMarked.annotation.id_annotation
        );

        if (found) {
          found.active = isAllowed;
        } else {
          const annotationMarker = this.createAnnotationMarker(annotationFetched);

          this.annotations.push({
            annotation: annotationFetched,
            active: isAllowed,
            marker: annotationMarker,
          });
        }
      });

      const inactive = this.annotations.filter(a => !a.active);
      inactive.forEach(a => this.map.removeLayer(a.marker));

      this.annotations = this.annotations.filter(a => a.active);
    });
  }

  private createAnnotationsListeners(){

    this.map.on('click', (e)=>{
      this.newPoint.emit([e.latlng.lat,e.latlng.lng]);
      this.assignPointToPolygon(e.latlng.lat,e.latlng.lng)
      this.clearCurrentMarker();

      this.currentMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map).bindTooltip("Zona de nueva anotación seleccionada", { permanent: true });
      this.currentMarker.setIcon(getCustomIcon());
      this.currentMarker.addEventListener('click',()=>{
        this.clearCurrentMarker();
        this.newPoint.emit(null);
      });
      
    });
  }

  private createAnnotationMarker(annotation: Annotation): L.Marker{
    const annotationMarker = L.marker([annotation.latitude, annotation.longitude]).addTo(this.map).bindTooltip(annotation.description);

    annotationMarker.setIcon(createMarkerIcon(annotation,this.annotationCategories,this.categories));

    annotationMarker.on('click', (e: L.LeafletMouseEvent) => {
      L.DomEvent.stop(e);

      this.assignPointToPolygon(annotation.latitude, annotation.longitude);
      this.selectedPoint.emit(annotation);
      this.clearCurrentMarker();
    });

    return annotationMarker;
  }

  private assignPointToPolygon(latitude: number, longitude: number){
    if (!this.points || Object.keys(this.points).length === 0) {
      this.clearCurrentPolygon();
      this.newNeighborhood.emit(null);
      return;
    }

    let polygonPoints: Point[] = [];

    Object.entries(this.points).forEach(([key, points]) => {
      const isInThisNeighborhood = isPointInPolygon(
        latitude,
        longitude,
        points
      );

      if (isInThisNeighborhood) {
        polygonPoints = points;
      }
    });

    if (polygonPoints.length > 0) {
      this.neighborhoodService.getById(polygonPoints[0].id_neighborhood as number).subscribe(neighborhood => {

        const polygon: NeighborhoodPolygon ={
          id_neighborhood: neighborhood.id_neighborhood as number,
          name_neighborhood: neighborhood.name,
          id_commune: neighborhood.id_commune,
          polygon_points: polygonPoints,
        }

        this.newNeighborhood.emit(polygon);

        const coords = polygon.polygon_points.map(p => [p.latitude, p.longitude] as [number, number]);
        this.clearCurrentPolygon();

        this.currentPolygon = L.polygon(coords).addTo(this.map).bindTooltip(neighborhood.name);
      })

    } else {
      this.clearCurrentPolygon();
      this.newNeighborhood.emit(null);
    }
  }

  private clearCurrentPolygon(){
    if (this.currentPolygon) {
      this.map.removeLayer(this.currentPolygon);
      this.currentPolygon = undefined as any;
    }
  }

  private clearCurrentMarker(): void {
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
      this.currentMarker = undefined as any;
    }
  }
}