import { Report } from "src/app/models/reports/reportResponse";
import { environment } from 'src/environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private readonly apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getReport(query: string): Observable<Report> {
    return this.http.post<Report>(this.apiUrl, {
      query: query
    });
  }
}