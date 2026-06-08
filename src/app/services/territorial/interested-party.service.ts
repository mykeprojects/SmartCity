import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { InterestedParty } from 'src/app/models/territorial/interested-party';
import { PagedResponse } from 'src/app/models/territorial/paged-response';
import { buildPagedParams } from './territorial-api.util';

@Injectable({ providedIn: 'root' })
export class InterestedPartyService {
  private readonly apiUrl = `${environment.apiUrl}/api/interested-parties`;

  constructor(private http: HttpClient) {}

  search(
    page: number,
    pageSize: number,
    filters: Record<string, string>
  ): Observable<PagedResponse<InterestedParty>> {
    return this.http.get<PagedResponse<InterestedParty>>(`${this.apiUrl}/search`, {
      params: buildPagedParams(page, pageSize, filters),
    });
  }
}
