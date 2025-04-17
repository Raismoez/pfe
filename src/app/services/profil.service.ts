import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8080/api/profile';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserProfile(identifiant: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${identifiant}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUserProfile(identifiant: string, profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${identifiant}`, profileData, {
      headers: this.getAuthHeaders()
    });
  }

  changePassword(identifiant: string, passwordData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password/${identifiant}`, passwordData, {
      headers: this.getAuthHeaders()
    });
  }

  uploadAvatar(identifiant: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post(`${this.apiUrl}/upload-avatar/${identifiant}`, formData, {
      headers: this.getAuthHeaders()
    });
  }
}