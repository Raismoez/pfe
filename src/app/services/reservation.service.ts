import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface qui correspond à l'entité Reservation côté backend
export interface Reservation {
  id?: number;
  nomDuProjet: string;
  constructeur: string;
  categorie: string;
  article: string;
  dateReservation: string; // Format ISO pour les dates
  status: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE';
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) { }

  // Créer une nouvelle réservation
  createReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }

  // Obtenir toutes les réservations
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  // Obtenir une réservation par ID
  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour une réservation
  updateReservation(id: number, reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservation);
  }

  // Supprimer une réservation
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Confirmer une réservation
  confirmReservation(id: number): Observable<Reservation> {
    const agentEmail = 'meriamdaadaa8@gmail.com'; 
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}/confirm?email=${agentEmail}`, {});
  }
  
  
  // Annuler une réservation
  cancelReservation(id: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // Obtenir les réservations par statut
  getReservationsByStatus(status: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE'): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/status/${status}`);
  }

  // Obtenir les réservations par constructeur
  getReservationsByConstructeur(constructeur: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/constructeur/${constructeur}`);
  }

  // Obtenir les réservations par catégorie
  getReservationsByCategorie(categorie: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/categorie/${categorie}`);
  }

  //  Envoyer l'email de confirmation après confirmation côté back
  sendConfirmationMail(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/sendMail`, null);
  }
}
