import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Stock } from '../stock/stock.component';

export interface ReservationDetails {
  nomProjet: string;
  constructeur: string;
  categorie: string;
  article: string;
  dateReservation: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:8080/api/stock';
  
  // BehaviorSubject pour les détails de réservation, avec valeur initiale null
  private reservationDetailsSubject = new BehaviorSubject<ReservationDetails | null>(null);
  
  // Observable qui permet aux autres composants de s'abonner aux changements
  reservationDetails$ = this.reservationDetailsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Méthode pour définir les détails de réservation
  setReservationDetails(details: ReservationDetails): void {
    console.log('Stockage des détails de réservation:', details);
    this.reservationDetailsSubject.next(details);
    
    // Sauvegarder dans localStorage pour persister les données entre navigations
    localStorage.setItem('reservationDetails', JSON.stringify(details));
  }

  // Méthode pour obtenir les détails actuels

getReservationDetails(): ReservationDetails | null {
  // Essayer d'abord d'obtenir depuis le BehaviorSubject
  let details = this.reservationDetailsSubject.getValue();
  
  // Si pas de détails, essayer de récupérer depuis localStorage
  if (!details) {
    const savedDetails = localStorage.getItem('reservationDetails');
    if (savedDetails) {
      details = JSON.parse(savedDetails);
      // Convertir les chaînes de dates en objets Date
      if (details && typeof details.dateReservation === 'string') {
        details.dateReservation = new Date(details.dateReservation);
      }
      
      // S'assurer que le constructeur est correctement formaté
      if (details && details.constructeur) {
        // Normaliser le constructeur (première lettre en majuscule)
        details.constructeur = 
          details.constructeur.charAt(0).toUpperCase() + 
          details.constructeur.slice(1).toLowerCase();
      }
      
      // Mettre à jour le BehaviorSubject
      this.reservationDetailsSubject.next(details);
    }
  }
  
  return details;
}

  // Méthode pour effacer les détails après confirmation
  clearReservationDetails(): void {
    this.reservationDetailsSubject.next(null);
    localStorage.removeItem('reservationDetails');
  }



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