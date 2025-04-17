import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StockItem {
  article: string;
  constructeur: string;
  categorie: string;
  date: string;
  quantite: number;
  endOfSale: string;
  endOfSupport: string;
  movementType?: 'entry' | 'exit';
  // Nouvelles colonnes
  dateM2: string;
  quantiteM2: number;
  dateM3: string;
  quantiteM3: number;
  dateM4: string;
  quantiteM4: number;
  dateM5: string;
  quantiteM5: number;
  dateM6: string;
  quantiteM6: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8080/api/dashboard';
  
  constructor(private http: HttpClient) { }
  
  getDashboardMetrics(): Observable<{
    totalArticles: number,
    totalQuantity: number,
    lowStockItemsCount: number,
    expiringItemsCount: number,
    totalEntries: number,
    totalExits: number
  }> {
    return this.http.get<any>(`${this.baseUrl}/metrics`);
  }
  
  getCategoryDistribution(): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.baseUrl}/category-distribution`);
  }
  
  getManufacturerDistribution(): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.baseUrl}/manufacturer-distribution`);
  }
  
  getStockEvolution(): Observable<{month: string, totalQuantity: number}[]> {
    return this.http.get<{month: string, totalQuantity: number}[]>(`${this.baseUrl}/stock-evolution`);
  }
  
  getEntriesAndExitsEvolution(): Observable<{month: string, totalEntries: number, totalExits: number}[]> {
    return this.http.get<{month: string, totalEntries: number, totalExits: number}[]>(`${this.baseUrl}/entries-exits-evolution`);
  }
  
  getStockItems(): Observable<StockItem[]> {
    return this.http.get<StockItem[]>(`${this.baseUrl}/stock-items`);
  }
  
  // Nouvelle méthode pour obtenir l'historique d'un article spécifique
  getItemHistory(itemId: string): Observable<StockItem> {
    return this.http.get<StockItem>(`${this.baseUrl}/stock-item/${itemId}/history`);
  }
}