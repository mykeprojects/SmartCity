import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MapLocation } from 'src/app/models/territorial/map-location';
import { MapMarker } from 'src/app/models/territorial/map-marker';


@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './point-map.component.html',
  styleUrl: './point-map.component.scss',
})
export class PointMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() latitude?: number;
  @Input() longitude?: number;
  @Input() markers: MapMarker[] = [];
  @Input() polygon: MapLocation[] = [];
  @Input() selectedMarkerId?: number | string | null;
  @Input() fitBounds = true;
  @Input() readonly = false;
  @Input() height = '320px';
  @Output() locationChange = new EventEmitter<MapLocation>();
  @Output() mapClick = new EventEmitter<MapLocation>();
  @Output() markerSelected = new EventEmitter<number | string>();
  @Output() markerMoved = new EventEmitter<{ id: number | string; location: MapLocation }>();

  private map?: L.Map;
  private marker?: L.Marker;
  private markerLayer?: L.LayerGroup;
  private polygonLayer?: L.LayerGroup;
  private resizeObserver?: ResizeObserver;

  private readonly defaultLat = 5.0703;
  private readonly defaultLng = -75.5138;

  ngAfterViewInit(): void {
    this.initMap();
    this.observeResize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;

    if (changes['markers'] || changes['polygon'] || changes['selectedMarkerId']) {
      this.renderMarkers();
      this.renderPolygon();
      return;
    }

    if (changes['latitude'] || changes['longitude']) {
      this.syncSingleMarker();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private initMap(): void {
    const lat = this.latitude ?? this.markers[0]?.latitude ?? this.defaultLat;
    const lng = this.longitude ?? this.markers[0]?.longitude ?? this.defaultLng;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: 14,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    if (this.markers.length > 0) {
      this.renderMarkers();
      this.renderPolygon();
      if (!this.readonly) {
        this.map.on('click', (e: L.LeafletMouseEvent) =>
          this.mapClick.emit({ latitude: e.latlng.lat, longitude: e.latlng.lng })
        );
      }
    } else {
      const icon = this.createMarkerIcon();
      this.marker = L.marker([lat, lng], { draggable: !this.readonly, icon }).addTo(this.map);
      this.bindSingleMarkerEvents();
    }

    setTimeout(() => this.map?.invalidateSize(), 250);
  }

  private renderMarkers(): void {
    if (!this.map) return;

    this.marker?.remove();
    this.marker = undefined;
    this.markerLayer?.clearLayers();
    this.markerLayer?.remove();
    this.markerLayer = L.layerGroup().addTo(this.map);

    const bounds: L.LatLngTuple[] = [];

    this.markers.forEach((item) => {
      if (item.latitude == null || item.longitude == null) return;
      const isSelected = this.selectedMarkerId != null && item.id === this.selectedMarkerId;
      const marker = L.marker([item.latitude, item.longitude], {
        draggable: !this.readonly,
        icon: this.createMarkerIcon(item, isSelected),
      });
      if (item.label) {
        marker.bindPopup(item.label);
      }
      if (item.id != null) {
        marker.on('click', () => this.markerSelected.emit(item.id!));
      }
      if (!this.readonly && item.id != null) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          this.markerMoved.emit({
            id: item.id!,
            location: { latitude: pos.lat, longitude: pos.lng },
          });
        });
      }
      marker.addTo(this.markerLayer!);
      bounds.push([item.latitude, item.longitude]);
    });

    if (bounds.length > 1) {
      if (this.fitBounds) {
        this.map.fitBounds(L.latLngBounds(bounds), { padding: [24, 24] });
      }
    } else if (bounds.length === 1 && this.fitBounds) {
      this.map.setView(bounds[0], 15);
    }
  }

  private renderPolygon(): void {
    if (!this.map) return;

    this.polygonLayer?.clearLayers();
    this.polygonLayer?.remove();
    this.polygonLayer = L.layerGroup().addTo(this.map);

    const points = this.polygon.length > 0 ? this.polygon : this.markers;
    const latLngs = points
      .filter((point) => point.latitude != null && point.longitude != null)
      .map((point) => [point.latitude, point.longitude] as L.LatLngTuple);

    if (latLngs.length >= 3) {
      L.polygon(latLngs, {
        color: '#2f6bff',
        weight: 2,
        fillColor: '#8db4ff',
        fillOpacity: 0.22,
      }).addTo(this.polygonLayer);
    } else if (latLngs.length === 2) {
      L.polyline(latLngs, {
        color: '#2f6bff',
        weight: 2,
      }).addTo(this.polygonLayer);
    }
  }

  private bindSingleMarkerEvents(): void {
    if (!this.map || !this.marker || this.readonly) return;

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const location = { latitude: e.latlng.lat, longitude: e.latlng.lng };
      this.mapClick.emit(location);
      this.setPosition(location.latitude, location.longitude);
    });
    this.marker.on('dragend', () => {
      const pos = this.marker!.getLatLng();
      this.emitLocation(pos.lat, pos.lng);
    });
  }

  private syncSingleMarker(): void {
    if (!this.map || this.markers.length > 0 || this.latitude == null || this.longitude == null) {
      return;
    }
    this.setPosition(this.latitude, this.longitude, false);
  }

  private setPosition(lat: number, lng: number, emit = true): void {
    this.marker?.setLatLng([lat, lng]);
    this.map?.panTo([lat, lng]);
    if (emit) {
      this.emitLocation(lat, lng);
    }
  }

  private emitLocation(lat: number, lng: number): void {
    this.locationChange.emit({ latitude: lat, longitude: lng });
  }

  private observeResize(): void {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  private createMarkerIcon(marker?: MapMarker, selected = false): L.DivIcon {
    const label = marker?.label ?? (marker?.order != null ? String(marker.order) : '•');
    const estadoClass = selected ? 'is-selected' : 'is-normal';

    return L.divIcon({
      className: `custom-map-marker ${estadoClass}`,
      // Envolvemos el label en el div que recibirá los estilos reales
      html: `<div class="marker-inner">${label}</div>`,
      iconSize:[28, 28],
      iconAnchor:[14,14],
    });
  }

}