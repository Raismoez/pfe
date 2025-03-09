import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface LoginResponse {
  message: string;
  userId: string;
  idRole: number;
  token?: string;
  user: {
    nomUtilisateur: string;
    email: string;
  };
}

interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(identifiant: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login`,
      { identifiant, password }
    ).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('idRole', response.idRole.toString());
      }),
      catchError(this.handleError)
    );
  }

  resetPassword(identifiant: string, nouveauMotDePasse: string, confirmationMotDePasse: string): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(
      `${this.baseUrl}/reset-password`,
      {
        identifiant,
        nouveauMotDePasse,
        confirmationMotDePasse
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur de connexion est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch(error.status) {
        case 400:
          errorMessage = error.error?.message || 'Requête incorrecte';
          break;
        case 401:
          errorMessage = 'Non autorisé. Vérifiez vos identifiants';
          break;
        case 404:
          errorMessage = 'Utilisateur non trouvé';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard';
          break;
      }
    }
    
    console.error('Détails de l\'erreur:', error);
    return throwError(() => new Error(errorMessage));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('idRole');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): number {
    const role = localStorage.getItem('idRole');
    return role ? parseInt(role) : 0;
  }
}