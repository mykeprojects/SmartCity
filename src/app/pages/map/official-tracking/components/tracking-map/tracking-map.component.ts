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
import { TrackedOfficialView } from 'src/app/models/territorial/official-tracking';

@Component({
  selector: 'app-tracking-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracking-map.component.html',
  styleUrl: './tracking-map.component.scss',
})
export class TrackingMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() officials: TrackedOfficialView[] = [];
  @Input() selectedId: number | null = null;
  @Input() fitBounds = true;
  @Output() officialSelected = new EventEmitter<number>();

  private map?: L.Map;
  private markerLayer?: L.LayerGroup;
  private markerById = new Map<number, L.Marker>();
  private resizeObserver?: ResizeObserver;
  private previousIdsString = '';

  private readonly defaultCenter: L.LatLngTuple = [5.0703, -75.5138];
  private readonly defaultZoom = 14;

  ngAfterViewInit(): void {
    this.initMap();
    this.observeResize();
    this.renderMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) {
      return;
    }

    if (changes['officials'] || changes['selectedId']) {
      this.renderMarkers();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  focusOfficial(id: number): void {
    const official = this.officials.find((item) => item.id === id);
    if (!official?.latitude || !official?.longitude || !this.map) {
      return;
    }
    this.map.setView([official.latitude, official.longitude], 16, { animate: true });
  }

  recenterMap(): void {
    if (!this.map) {
      return;
    }
    const bounds: L.LatLngTuple[] = [];
    this.officials.forEach((official) => {
      if (official.latitude != null && official.longitude != null) {
        bounds.push([official.latitude, official.longitude]);
      }
    });

    if (bounds.length > 1) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [48, 48] });
    } else if (bounds.length === 1) {
      this.map.setView(bounds[0], 15);
    } else {
      this.map.setView(this.defaultCenter, this.defaultZoom);
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);
    setTimeout(() => this.map?.invalidateSize(), 250);
  }

  private renderMarkers(): void {
    if (!this.map || !this.markerLayer) {
      return;
    }

    const visibleIds = new Set<number>();
    const bounds: L.LatLngTuple[] = [];

    this.officials.forEach((official) => {
      if (official.latitude == null || official.longitude == null) {
        return;
      }

      visibleIds.add(official.id);
      const latLng: L.LatLngTuple = [official.latitude, official.longitude];
      bounds.push(latLng);

      const icon = this.createMarkerIcon(official);
      const existing = this.markerById.get(official.id);

      if (existing) {
        existing.setLatLng(latLng);
        existing.setIcon(icon);
      } else {
        const marker = L.marker(latLng, { icon });
        marker.on('click', () => this.officialSelected.emit(official.id));
        marker.addTo(this.markerLayer!);
        this.markerById.set(official.id, marker);
      }
    });

    this.markerById.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        marker.remove();
        this.markerById.delete(id);
      }
    });

    const currentIdsString = this.officials
      .filter((o) => o.latitude != null && o.longitude != null)
      .map((o) => o.id)
      .sort((a, b) => a - b)
      .join(',');

    const idsChanged = currentIdsString !== this.previousIdsString;
    this.previousIdsString = currentIdsString;

    if (idsChanged && this.fitBounds) {
      if (bounds.length > 1) {
        this.map.fitBounds(L.latLngBounds(bounds), { padding: [48, 48] });
      } else if (bounds.length === 1) {
        this.map.setView(bounds[0], 15);
      }
    }
  }

  private createMarkerIcon(official: TrackedOfficialView): L.DivIcon {
    const isSelected = this.selectedId === official.id;
    const statusClass = official.isOnline ? 'is-online' : 'is-offline';
    const selectedClass = isSelected ? 'is-selected' : '';
    const timeLabel = this.formatMarkerTime(official.lastGpsUpdate);

    return L.divIcon({
      className: `tracking-marker ${statusClass} ${selectedClass}`.trim(),
      html: `
        <div class="tracking-marker__wrapper">
          <div class="tracking-marker__avatar">
            <span>${official.initials}</span>
            <span class="tracking-marker__status"></span>
          </div>
          <div class="tracking-marker__label">
            <strong>${official.name}</strong>
            <span>${timeLabel}</span>
          </div>
        </div>
      `,
      iconSize: [120, 72],
      iconAnchor: [60, 28],
    });
  }

  private formatMarkerTime(value: string | null): string {
    if (!value) {
      return 'Sin hora';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Sin hora';
    }
    return date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  }

  private observeResize(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }
}
