import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { Entity } from 'src/app/models/territorial/entity';
import { Official } from 'src/app/models/territorial/official';
import {
  OfficialTrackingPosition,
  TrackedOfficialView,
} from 'src/app/models/territorial/official-tracking';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { TrackingMapComponent } from './components/tracking-map/tracking-map.component';
import { EntityService } from 'src/app/services/territorial/entity.service';
import { GeocodingService } from 'src/app/services/territorial/geocoding.service';
import { OfficialService } from 'src/app/services/territorial/official.service';
import { OfficialTrackingSocketService } from 'src/app/services/official-tracking.socket.service';

const ONLINE_THRESHOLD_MS = 60_000;

@Component({
  selector: 'app-official-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    TrackingMapComponent,
  ],
  templateUrl: './official-tracking.component.html',
  styleUrl: './official-tracking.component.scss',
})
export class OfficialTrackingComponent implements OnInit, OnDestroy {
  @ViewChild(TrackingMapComponent) trackingMap?: TrackingMapComponent;

  entities: Entity[] = [];
  selectedEntityId: number | null = null;
  officials: TrackedOfficialView[] = [];
  filteredOfficials: TrackedOfficialView[] = [];
  searchTerm = '';
  selectedOfficialId: number | null = null;
  loading = false;
  socketConnected = false;
  lastUpdate: Date | null = null;

  private readonly destroy$ = new Subject<void>();
  private readonly addressCache = new Map<number, string>();
  private readonly socketTimestamps = new Map<number, number>();
  private rawOfficials: Official[] = [];

  constructor(
    private entityService: EntityService,
    private officialService: OfficialService,
    private geocodingService: GeocodingService,
    private trackingSocket: OfficialTrackingSocketService
  ) {}

  ngOnInit(): void {
    this.trackingSocket.connect();

    this.trackingSocket.connectionStatus
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected) => {
        this.socketConnected = connected;
      });

    this.trackingSocket.tracking.pipe(takeUntil(this.destroy$)).subscribe((payload) => {
      this.applyTrackingUpdates(payload.officials);
      this.lastUpdate = new Date();
    });

    this.loadEntities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.trackingSocket.disconnect();
  }

  get activeCount(): number {
    return this.filteredOfficials.filter((official) => official.isOnline).length;
  }

  get offlineCount(): number {
    return this.filteredOfficials.filter((official) => !official.isOnline).length;
  }

  get totalCount(): number {
    return this.filteredOfficials.length;
  }

  get selectedEntityName(): string {
    if (this.selectedEntityId == null) {
      return 'Todas las entidades';
    }
    return this.entities.find((entity) => entity.id_entity === this.selectedEntityId)?.name
      ?? 'Entidad seleccionada';
  }

  onEntityChange(entityId: number | null): void {
    this.selectedEntityId = entityId;
    this.searchTerm = '';
    this.selectedOfficialId = null;
    this.loadOfficials();
  }

  onSearchChange(): void {
    this.applySearchFilter();
  }

  refresh(): void {
    this.loadOfficials();
  }

  selectOfficial(id: number): void {
    this.selectedOfficialId = id;
    this.trackingMap?.focusOfficial(id);
  }

  formatListTime(value: string | null, isOnline: boolean): string {
    if (!value) {
      return isOnline ? 'En línea' : 'Sin conexión';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return isOnline ? 'En línea' : 'Sin conexión';
    }
    const formatted = date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
    return isOnline ? formatted : `Últ. ${formatted}`;
  }

  private loadEntities(): void {
    this.entityService.getAll().subscribe({
      next: (entities) => {
        this.entities = Array.isArray(entities) ? entities : [];
        if (this.entities.length && this.selectedEntityId == null) {
          this.selectedEntityId = this.entities[0].id_entity ?? null;
        }
        this.loadOfficials();
      },
      error: () => this.loadOfficials(),
    });
  }

  private loadOfficials(): void {
    if (this.selectedEntityId == null) {
      this.rawOfficials = [];
      this.officials = [];
      this.filteredOfficials = [];
      return;
    }

    this.loading = true;
    this.officialService.searchByFilter(this.selectedEntityId).subscribe({
      next: (response) => {
        this.rawOfficials = this.normalizeOfficials(response);
        this.officials = this.rawOfficials.map((official) => this.toTrackedView(official));
        this.applySearchFilter();
        this.resolveAddresses();
        this.startTracking();
        this.lastUpdate = new Date();
        this.loading = false;
      },
      error: () => {
        this.rawOfficials = [];
        this.officials = [];
        this.filteredOfficials = [];
        this.loading = false;
      },
    });
  }

  private startTracking(): void {
    const trackableIds = this.rawOfficials
      .filter((official) => this.canTrack(official))
      .map((official) => official.id_official!)
      .filter((id) => id != null);

    if (!trackableIds.length) {
      return;
    }

    this.officialService.startTracking(trackableIds).subscribe();
  }

  private applyTrackingUpdates(updates: OfficialTrackingPosition[]): void {
    const now = Date.now();

    updates.forEach((update) => {
      this.socketTimestamps.set(update.id_official, now);

      const official = this.officials.find((item) => item.id === update.id_official);
      if (!official) {
        return;
      }

      official.latitude = update.latitude;
      official.longitude = update.longitude;
      official.lastGpsUpdate = update.last_gps_update;
      official.isOnline = true;
      this.resolveAddress(official);
    });

    this.officials = this.officials.map((official) => ({
      ...official,
      isOnline: this.isOfficialOnline(official.id, official.lastGpsUpdate, official.isOnline),
    }));

    this.applySearchFilter();
  }

  private toTrackedView(official: Official): TrackedOfficialView {
    const id = official.id_official ?? 0;
    const lastGpsUpdate = official.last_gps_update ?? null;

    return {
      id,
      name: official.name,
      role: official.role,
      latitude: official.last_latitude ?? null,
      longitude: official.last_longitude ?? null,
      lastGpsUpdate,
      isOnline: this.isOfficialOnline(id, lastGpsUpdate, false),
      address: this.addressCache.get(id) ?? null,
      initials: this.getInitials(official.name),
    };
  }

  private isOfficialOnline(id: number, lastGpsUpdate: string | null, fallback: boolean): boolean {
    const socketAt = this.socketTimestamps.get(id);
    if (socketAt && Date.now() - socketAt <= ONLINE_THRESHOLD_MS) {
      return true;
    }

    if (!lastGpsUpdate) {
      return fallback;
    }

    const updatedAt = new Date(lastGpsUpdate).getTime();
    if (Number.isNaN(updatedAt)) {
      return fallback;
    }

    return Date.now() - updatedAt <= ONLINE_THRESHOLD_MS;
  }

  private canTrack(official: Official): boolean {
    const status = official.status?.trim().toLowerCase();
    const isActive = status === 'active' || status === 'activo';
    return Boolean(
      official.id_official &&
        official.gps_active &&
        isActive &&
        official.last_latitude != null &&
        official.last_longitude != null
    );
  }

  private applySearchFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredOfficials = term
      ? this.officials.filter((official) => official.name.toLowerCase().includes(term))
      : [...this.officials];
  }

  private resolveAddresses(): void {
    this.officials
      .filter((official) => official.latitude != null && official.longitude != null && !official.address)
      .forEach((official) => this.resolveAddress(official));
  }

  private resolveAddress(official: TrackedOfficialView): void {
    if (official.latitude == null || official.longitude == null || this.addressCache.has(official.id)) {
      return;
    }

    this.geocodingService.reverseGeocode(official.latitude, official.longitude).subscribe({
      next: (address) => {
        if (!address) {
          return;
        }
        this.addressCache.set(official.id, address);
        official.address = address;
        this.applySearchFilter();
      },
    });
  }

  private normalizeOfficials(response: Official[] | PagedResponse<Official>): Official[] {
    if (Array.isArray(response)) {
      return response;
    }
    return response.items ?? [];
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return 'FN';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
}
