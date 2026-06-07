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

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly apiUrl = 'https://nominatim.openstreetmap.org/search';

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
      .get<NominatimResult[]>(this.apiUrl, {
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
