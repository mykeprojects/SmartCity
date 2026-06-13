import { AfterViewInit, Component, ElementRef, Input, Output, OnDestroy, ViewChild, EventEmitter } from '@angular/core';
import { Annotation } from 'src/app/models/annotations/annotation';
import { AnnotationForMarker } from 'src/app/models/annotations/annotationForMarker';
import { AnnotationService } from 'src/app/services/territorial/annotation.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {

  constructor(private annotationService: AnnotationService,){

  }

  @Input() center: [number, number] = [5.0703, -75.5138];
  @Input() zoom = 13;
  @Input() isAnotationMode = true;
  @Output() newPoint = new EventEmitter<[number,number] | null>;
  @Output() selectedPoint = new EventEmitter<Annotation>;

  @ViewChild('mapContainer', { static: false })
  mapContainer!: ElementRef;

  private map!: L.Map;

  private annotations: AnnotationForMarker[] = [];

  private currentMarker: L.Marker;

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
    this.initMap();
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

    if (this.isAnotationMode){
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
    this.annotationService.getAll().subscribe(annotations => {
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
          const annotationMarker = L.marker([annotationFetched.latitude, annotationFetched.longitude]).addTo(this.map).bindTooltip(annotationFetched.description);
          const newAnnotation: AnnotationForMarker = {
            annotation: annotationFetched,
            active: true,
            marker: annotationMarker,
          };

          annotationMarker.setIcon(this.customIcon);

          annotationMarker.addEventListener('click',(e)=>{
            this.selectedPoint.emit(annotationFetched);
          })
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

      this.currentMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map).bindTooltip("Zona de nueva anotación seleccionada",{ permanent: true});
      this.currentMarker.setIcon(customIcon);
      this.currentMarker.addEventListener('click',()=>{
        this.map.removeLayer(this.currentMarker);
        this.newPoint.emit(null);
      })
      
    })

  }
}