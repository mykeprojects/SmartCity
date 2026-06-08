import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MapLocation } from 'src/app/components/map/map-picker.component';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name?: string;
}

interface NominatimReverseResult {
  display_name?: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    state?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly searchUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly reverseUrl = 'https://nominatim.openstreetmap.org/reverse';

  constructor(private http: HttpClient) {}

  geocodeAddress(address: string): Observable<MapLocation | null> {
    const query = this.buildQuery(address);
    if (!query) {
      return of(null);
    }

    const params = new HttpParams()
      .set('q', query)
      .set('format', 'json')
      .set('limit', '1')
      .set('countrycodes', 'co');

    return this.http
      .get<NominatimResult[]>(this.searchUrl, {
        params,
        headers: {
          'Accept-Language': 'es',
        },
      })
      .pipe(
        map((results) => {
          if (!results?.length) return null;
          return {
            latitude: Number(results[0].lat),
            longitude: Number(results[0].lon),
          };
        }),
        catchError(() => of(null))
      );
  }

  reverseGeocode(latitude: number, longitude: number): Observable<string | null> {
    const params = new HttpParams()
      .set('lat', String(latitude))
      .set('lon', String(longitude))
      .set('format', 'json');

    return this.http
      .get<NominatimReverseResult>(this.reverseUrl, {
        params,
        headers: {
          'Accept-Language': 'es',
        },
      })
      .pipe(
        map((result) => this.formatReverseAddress(result)),
        catchError(() => of(null))
      );
  }

  private formatReverseAddress(result: NominatimReverseResult): string | null {
    const address = result.address;
    if (address) {
      const street = [address.road, address.house_number].filter(Boolean).join(' # ');
      const locality = address.suburb || address.neighbourhood;
      const city = address.city || address.town;
      const parts = [street, locality, city, address.state].filter(Boolean);
      const unique = [...new Set(parts)];
      if (unique.length) {
        return unique.join(', ');
      }
    }

    const displayName = result.display_name?.trim();
    if (!displayName) return null;

    return displayName.split(',').slice(0, 4).join(',').trim();
  }

  private buildQuery(address: string): string {
    const trimmed = address.trim();
    if (trimmed.length < 5) return '';

    const hasColombia = /colombia/i.test(trimmed);
    const hasManizales = /manizales/i.test(trimmed);

    if (hasColombia) return trimmed;
    if (hasManizales) return `${trimmed}, Colombia`;
    return `${trimmed}, Manizales, Caldas, Colombia`;
  }
}
