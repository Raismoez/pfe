import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';

export interface Offer {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  offreType?: string; 
  popular?: boolean;
  details: {
    objectives: string[];
    description: string;
    features: string[];
    price?: string;
    pricing?: {
      paymentOptions: string[];
    };
    subscription?: {
      channels: string[];
    };
  };
}
@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private offersSubject = new BehaviorSubject<Offer[]>([]);
  offers$ = this.offersSubject.asObservable();
  
  // Replace with your Spring Boot API URL
  private apiUrl = 'http://localhost:8080/api/offers';

  constructor(private http: HttpClient) {
    // Load offers from backend when service is initialized
    this.loadOffers();
  }

  private loadOffers(): void {
    this.http.get<any[]>(this.apiUrl)
      .pipe(
        map(rawOffers => this.mapResponseToOffers(rawOffers)),
        catchError(this.handleError)
      )
      .subscribe(offers => {
        this.offersSubject.next(offers);
      });
  }

  getOffers(): Observable<Offer[]> {
    return this.offers$;
  }

  getOfferById(id: number): Observable<Offer> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(rawOffer => this.mapResponseToOffer(rawOffer)),
        catchError(this.handleError)
      );
  }

  searchOffers(query: string): Observable<Offer[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?query=${query}`)
      .pipe(
        map(rawOffers => this.mapResponseToOffers(rawOffers)),
        catchError(this.handleError)
      );
  }

  addOffer(offer: Omit<Offer, 'id'>): Observable<Offer> {
    const requestPayload = this.prepareOfferForRequest(offer);
    
    return this.http.post<any>(this.apiUrl, requestPayload)
      .pipe(
        map(response => this.mapResponseToOffer(response)),
        tap(newOffer => {
          const currentOffers = this.offersSubject.value;
          this.offersSubject.next([...currentOffers, newOffer]);
        }),
        catchError(this.handleError)
      );
  }

  updateOffer(updatedOffer: Offer): Observable<Offer> {
    const requestPayload = this.prepareOfferForRequest(updatedOffer);

    return this.http.put<any>(`${this.apiUrl}/${updatedOffer.id}`, requestPayload)
      .pipe(
        map(response => this.mapResponseToOffer(response)),
        tap(updated => {
          const currentOffers = this.offersSubject.value;
          const index = currentOffers.findIndex(o => o.id === updated.id);
          if (index !== -1) {
            const newOffers = [...currentOffers];
            newOffers[index] = updated;
            this.offersSubject.next(newOffers);
          }
        }),
        catchError(this.handleError)
      );
  }

  deleteOffer(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.deleted || true),
        tap(_ => {
          const currentOffers = this.offersSubject.value;
          this.offersSubject.next(currentOffers.filter(offer => offer.id !== id));
        }),
        catchError(this.handleError)
      );
  }

  // Map backend response to Offer model
  private mapResponseToOffer(data: any): Offer {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      offreType: data.offreType, 
      popular: data.popular || false,
      details: {
        objectives: data.objectives || [],
        description: data.detailsDescription || '',
        features: data.features || [],
        price: data.prix || '',
        pricing: {
          paymentOptions: data.paymentOptions || []
        },
        subscription: {
          channels: data.subscriptionChannels || []
        }
      }
    };
  }

  // Map multiple backend responses to Offer models
  private mapResponseToOffers(data: any[]): Offer[] {
    return data.map(item => this.mapResponseToOffer(item));
  }

  // Prepare Offer for backend request
  private prepareOfferForRequest(offer: Offer | Omit<Offer, 'id'>): any {
    return {
      id: 'id' in offer ? offer.id : undefined,
      title: offer.title,
      description: offer.description,
      imageUrl: offer.imageUrl,
      offreType: offer.offreType, // Ajout du champ offreType
      popular: offer.popular,
      objectives: offer.details.objectives || [],
      detailsDescription: offer.details.description,
      features: offer.details.features || [],
      prix: offer.details.price || '',
      paymentOptions: offer.details.pricing?.paymentOptions || [],
      subscriptionChannels: offer.details.subscription?.channels || []
    };
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}