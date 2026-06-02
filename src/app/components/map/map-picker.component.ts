import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface MapLocation {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-picker.component.html',
  styleUrl: './map-picker.component.scss',
})
export class MapPickerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() latitude?: number;
  @Input() longitude?: number;
  @Input() readonly = false;
  @Input() height = '320px';
  @Output() locationChange = new EventEmitter<MapLocation>();

  private map?: L.Map;
  private marker?: L.Marker;

  private readonly defaultLat = 5.0703;
  private readonly defaultLng = -75.5138;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && (changes['latitude'] || changes['longitude'])) {
      this.syncMarker();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    const lat = this.latitude ?? this.defaultLat;
    const lng = this.longitude ?? this.defaultLng;

    this.map = L.map('territorial-map', {
      center: [lat, lng],
      zoom: 14,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    this.marker = L.marker([lat, lng], { draggable: !this.readonly, icon }).addTo(this.map);

    if (!this.readonly) {
      this.map.on('click', (e: L.LeafletMouseEvent) => this.setPosition(e.latlng.lat, e.latlng.lng));
      this.marker.on('dragend', () => {
        const pos = this.marker!.getLatLng();
        this.emitLocation(pos.lat, pos.lng);
      });
    }

    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  private syncMarker(): void {
    if (!this.map || this.latitude == null || this.longitude == null) {
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
}
