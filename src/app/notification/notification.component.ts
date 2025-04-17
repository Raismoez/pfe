import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, NotificationRequest } from '../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {
  showNotificationModal: boolean = false;
  
  notificationSettings: NotificationRequest = {
    recipients: '',
    subject: 'Rapport de Stock',
    scheduleTime: '',
    sendNow: true,
    notificationTypes: {
      outOfStock: true,
      lowStock: true,
      endOfSale: true,
      endOfSupport: true
    }
  };

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Initialisation supplémentaire si nécessaire
  }

  // Ouvrir le modal de notification
  openNotificationModal() {
    console.log('Opening notification modal');
    this.showNotificationModal = true;
  }
  
  // Fermer le modal de notification
  closeNotificationModal() {
    console.log('Closing notification modal');
    this.showNotificationModal = false;
    
    // Réinitialiser les paramètres
    this.notificationSettings = {
      recipients: '',
      subject: 'Rapport de Stock',
      scheduleTime: '',
      sendNow: true,
      notificationTypes: {
        outOfStock: true,
        lowStock: true,
        endOfSale: true,
        endOfSupport: true
      }
    };
  }
  
  // Vérifier la validité du formulaire de notification
  isNotificationFormValid(): boolean {
    // Vérifier si au moins un type de notification est sélectionné
    const anyTypeSelected = Boolean(this.notificationSettings.notificationTypes?.outOfStock) ||
                       Boolean(this.notificationSettings.notificationTypes?.lowStock) ||
                       Boolean(this.notificationSettings.notificationTypes?.endOfSale) ||
                       Boolean(this.notificationSettings.notificationTypes?.endOfSupport);
    
    // Validation basique des emails
    const hasValidRecipients = this.notificationSettings.recipients.trim() !== '';
    
    // Vérifier l'heure programmée si pas d'envoi immédiat
    const hasValidSchedule = this.notificationSettings.sendNow ||
     (this.notificationSettings.scheduleTime !== null && 
      this.notificationSettings.scheduleTime !== '');
    
    return hasValidRecipients && hasValidSchedule && anyTypeSelected && this.notificationSettings.subject.trim() !== '';
  }
  
  // Envoyer une notification
  sendNotification() {
    if (!this.isNotificationFormValid()) {
      return;
    }
    
    const payload: NotificationRequest = {
      recipients: this.notificationSettings.recipients,
      subject: this.notificationSettings.subject,
      sendNow: this.notificationSettings.sendNow,
      scheduleTime: this.notificationSettings.sendNow ? null : this.notificationSettings.scheduleTime,
      notificationTypes: this.notificationSettings.notificationTypes
    };
    
    this.notificationService.sendNotification(payload).subscribe({
      next: (response) => {
        console.log('Notification sent successfully:', response);
        this.closeNotificationModal();
        alert(this.notificationSettings.sendNow ?
             'Notification envoyée avec succès!' :
             'Notification programmée avec succès!');
      },
      error: (error) => {
        console.error('Error sending notification:', error);
        alert(`Erreur: ${error.error?.message || 'Une erreur est survenue lors de l\'envoi de la notification'}`);
      }
    });
  }
}