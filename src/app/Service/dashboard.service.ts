import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardMetrics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/metrics`);
  }

  getCategoryDistribution(): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.baseUrl}/category-distribution`);
  }

  getManufacturerDistribution(): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.baseUrl}/manufacturer-distribution`);
  }

  getStockEvolution(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stock-evolution`);
  }

  getEntriesAndExitsEvolution(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/entries-exits-evolution`);
  }
}
