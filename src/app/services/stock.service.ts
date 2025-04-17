import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../stock/stock.component';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:8080/api/stock';

  constructor(private http: HttpClient) { }

  // Get all stocks
  getAllStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/articles`);
  }

  // Get stock by ID
  getStockById(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/articles/${id}`);
  }


  // Delete stock
  deleteStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/articles/${id}`);
  }

  // Get stocks by manufacturer
  getStocksByConstructeur(constructeur: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/articles/constructeur/${constructeur}`);
  }

  // Get stocks by category
  getStocksByCategory(categorie: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/articles/categorie/${categorie}`);
  }

  // Get out of stock articles
  getOutOfStockArticles(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/articles/out-of-stock`);
  }

  // Get low stock articles
  getLowStockArticles(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/articles/low-stock`);
  }

  // Get end of sale articles
  getEndOfSaleArticles(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/articles/end-of-sale`);
  }

  // Get end of support articles
  getEndOfSupportArticles(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/articles/end-of-support`);
  }
  private formatStockForSending(stock: Stock): any {
    return {
      ...stock,
      date: stock.date ? stock.date : null,
      endOfSale: stock.endOfSale ? stock.endOfSale : null,
      endOfSupport: stock.endOfSupport ? stock.endOfSupport : null
    };
  }
  
  
  createStock(stock: Stock): Observable<Stock> {
    
    const { id, ...stockData } = this.formatStockForSending(stock);
    return this.http.post<Stock>(`${this.apiUrl}/articles`, stockData);
  }
  
  updateStock(id: number, stock: Stock): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}/articles/${id}`, this.formatStockForSending(stock));
  }


}