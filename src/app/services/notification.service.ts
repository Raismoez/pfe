import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationRequest {
  recipients: string;
  subject: string;
  sendNow: boolean;
  scheduleTime: string | null;
  notificationTypes: {
    outOfStock: boolean;
    lowStock: boolean;
    endOfSale: boolean;
    endOfSupport: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) { }

  sendNotification(notificationRequest: NotificationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, notificationRequest);
  }

  // Pour les notifications programmées
  getScheduledNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/scheduled`);
  }

  // Pour annuler une notification programmée
  cancelScheduledNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/scheduled/${id}`);
  }
}