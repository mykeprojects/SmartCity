import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {

  @Input() center: [number, number] = [5.0703, -75.5138];
  @Input() zoom = 13;

  @ViewChild('mapContainer', { static: false })
  mapContainer!: ElementRef;

  private map!: L.Map;

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
}