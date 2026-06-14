import { AfterViewInit, Component, ElementRef, Input, Output, OnDestroy, ViewChild, EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';
import { Annotation } from 'src/app/models/annotations/annotation';
import { AnnotationForMarker } from 'src/app/models/annotations/annotationForMarker';
import { AnnotationService } from 'src/app/services/territorial/annotation.service';
import * as L from 'leaflet';
import { CategoryService } from 'src/app/services/territorial/category.service';
import { Category } from 'src/app/models/territorial/category';
import { AnnotationCategoryService } from 'src/app/services/territorial/annotation-category.service';
import { AnnotationCategory } from 'src/app/models/territorial/annotation-category';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {

  constructor(private annotationService: AnnotationService, private categoryService: CategoryService, private annotationCategoryService: AnnotationCategoryService){

  }

  @Input() center: [number, number] = [5.0703, -75.5138];
  @Input() zoom = 13;
  @Input() currentCategory?: number[];
  @Input() currentSubcategory?: number[];
  @Input() isAnnotationMode?: boolean;
  @Input() mapRefreshTrigger?: number;
  @Output() newPoint = new EventEmitter<[number,number] | null>;
  @Output() selectedPoint = new EventEmitter<Annotation>;

  @ViewChild('mapContainer', { static: false })
  mapContainer!: ElementRef;

  private map!: L.Map;

  private annotations: AnnotationForMarker[] = [];

  private currentMarker: L.Marker;

  private categories: Category[];
  private annotationCategories: AnnotationCategory[];

  private customIcon = L.icon({
    iconUrl: 'assets/images/leaflet/marker-icon.png',
    iconRetinaUrl: 'assets/images/leaflet/marker-icon-2x.png',
    shadowUrl: 'assets/images/leaflet/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  ngAfterViewInit(): void {
    forkJoin({
      categories: this.categoryService.getAll(),
      annotationCategories: this.annotationCategoryService.getAll()
    }).subscribe(result => {
      this.categories = result.categories;
      this.annotationCategories = result.annotationCategories;

      this.initMap();
    });
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes['mapRefreshTrigger'] && this.map){
      this.fetchAnnotations();
      console.log("Cambio registrado")
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
      annotations: this.annotationService.getAll(),
      annotationCategories: this.annotationCategoryService.getAll()
    }).subscribe(({ annotations, annotationCategories }) => {
      this.annotationCategories = annotationCategories;

      this.annotations.forEach(annotation => {
        annotation.active = false;
      });

      annotations.forEach(annotationFetched => {
        const found = this.annotations.find(annotationMarked =>
          annotationFetched.id_annotation === annotationMarked.annotation.id_annotation
        );

        if (found) {
          found.active = true;
        } else {
          const annotationMarker = this.createAnnotationMarker(annotationFetched);
          const newAnnotation: AnnotationForMarker = {
            annotation: annotationFetched,
            active: true,
            marker: annotationMarker,
          };
          this.annotations.push(newAnnotation);
        }
      });

      const inactiveAnnotations = this.annotations.filter(annotation => (!annotation.active));
      inactiveAnnotations.forEach(inactiveAnnotation => {
        this.map.removeLayer(inactiveAnnotation.marker);
      })

      this.annotations = this.annotations.filter(annotation => annotation.active);
    });
  }

  private createAnnotationsListeners(){
    const customIcon = L.icon({
      iconUrl: 'assets/images/leaflet/marker-icon.png',
      iconRetinaUrl: 'assets/images/leaflet/marker-icon-2x.png',
      shadowUrl: 'assets/images/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.map.on('click', (e)=>{
      this.newPoint.emit([e.latlng.lat,e.latlng.lng]);
      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
      }

      this.currentMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map).bindTooltip("Zona de nueva anotación seleccionada", { permanent: true });
      this.currentMarker.setIcon(customIcon);
      this.currentMarker.addEventListener('click',()=>{
        this.map.removeLayer(this.currentMarker);
        this.newPoint.emit(null);
      });
      
    });
  }
  
  private getColorFromString(text: string): string {
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;

    return `hsl(${hue}, 70%, 50%)`;
  }

  private createColoredIcon(category: string): L.DivIcon {
    const color = this.getColorFromString(category);

    return L.divIcon({
      className: '',
      html: `
        <svg width="25" height="41" viewBox="0 0 25 41">
          <path
            d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.8 12.5 41 12.5 41S25 21.8 25 12.5C25 5.6 19.4 0 12.5 0Z"
            fill="${color}"
            stroke="black"
            stroke-width="1"
          />
        </svg>
      `,
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
  }

  private createAnnotationMarker(annotation: Annotation): L.Marker{
    const annotationMarker = L.marker([annotation.latitude, annotation.longitude]).addTo(this.map).bindTooltip(annotation.description);


    annotationMarker.setIcon(this.createMarkerIcon(annotation));

    annotationMarker.on('click', (e: L.LeafletMouseEvent) => {
      L.DomEvent.stop(e);
      this.selectedPoint.emit(annotation);
      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
      }
    })

    return annotationMarker;
  }

  createMarkerIcon(annotation: Annotation): L.Icon | L.DivIcon{
    const foundCategoryAnnotation = this.annotationCategories.find(annotationCategory => annotation.id_annotation == annotationCategory.id_annotation)
    if (!foundCategoryAnnotation || !foundCategoryAnnotation.id_category) {
      return this.customIcon;
    }


    const foundCategory = this.categories.find(category => category.id_category == foundCategoryAnnotation.id_category)

    if (foundCategory?.id_parent_category){
      const foundParentCategory = this.categories.find(category => category.id_category == foundCategory.id_parent_category)
      if (foundParentCategory?.name){
        return this.createColoredIcon(foundParentCategory?.name);
      }
      return this.customIcon;

    }
    if (foundCategory?.name){
      return this.createColoredIcon(foundCategory.name);
    }
    return this.customIcon;
  }
}