import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-motdepasse',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './motdepasse.component.html',
  styleUrls: ['./motdepasse.component.css']
})
export class MotdepasseComponent implements OnInit, OnDestroy {
  // Champs du formulaire
  identifiant: string = '';
  nouveauMotDePasse: string = '';
  confirmationMotDePasse: string = '';
  
  // Messages d'erreur
  messageErreurIdentifiant: string = '';
  messageErreurMdp: string = '';
  messageErreurConfirmation: string = '';
  
  // Propriétés pour les notifications
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';
  notificationTimeout: any = null;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    // Initialisation
  }
  
  ngOnDestroy() {
    // Nettoyer le timeout de notification si existant
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }
  
  // Méthode pour afficher les notifications
  showNotificationMessage(message: string, type: 'success' | 'error' | 'warning' = 'success', duration: number = 3000) {
    // Annuler tout timeout existant
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    
    // Définir le message et afficher la notification
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Masquer automatiquement après la durée spécifiée
    this.notificationTimeout = setTimeout(() => {
      this.showNotification = false;
    }, duration);
  }
  
  // Redirection vers la page de login
  login() {
    this.router.navigateByUrl("/");
  }
  
  // Validation et envoi du formulaire
  validerMotDePasse() {
    // Effacer les erreurs précédentes
    this.messageErreurIdentifiant = '';
    this.messageErreurMdp = '';
    this.messageErreurConfirmation = '';
    
    // Validation de l'identifiant
    if (!this.identifiant) {
      this.messageErreurIdentifiant = "L'identifiant est requis.";
      return;
    }
    
    // Validation du mot de passe
    if (this.nouveauMotDePasse.length < 8) {
      this.messageErreurMdp = "Le mot de passe doit contenir au moins 8 caractères.";
     
    }
    
    // Validation de la confirmation
    if (this.nouveauMotDePasse !== this.confirmationMotDePasse) {
      this.messageErreurConfirmation = "La confirmation du mot de passe ne correspond pas.";
      return;
    }
    
    // Utiliser le service d'authentification pour réinitialiser le mot de passe
    this.authService.resetPassword(
      this.identifiant,
      this.nouveauMotDePasse,
      this.confirmationMotDePasse
    ).subscribe({
      next: (response) => {
        // Succès
        this.showNotificationMessage("Mot de passe changé avec succès !", 'success');
        this.nouveauMotDePasse = '';
        this.confirmationMotDePasse = '';
        
        // Rediriger après un court délai pour permettre à l'utilisateur de voir la notification
        setTimeout(() => {
          this.router.navigateByUrl("/");
        }, 2000);
      },
      error: (error) => {
        // Gestion des erreurs
        console.error('Erreur:', error);
        
        const errorMessage = error.message || "Une erreur s'est produite. Veuillez réessayer.";
        
     
       
        
        // Également mettre à jour les messages d'erreur spécifiques aux champs
        if (errorMessage.includes("Identifiant") || errorMessage.includes("utilisateur")) {
          this.messageErreurIdentifiant = errorMessage;
        } else if (errorMessage.includes("mot de passe")) {
          this.messageErreurMdp = errorMessage;
        } else {
          this.messageErreurConfirmation = errorMessage;
        }
      }
    });
  }
  
  
}