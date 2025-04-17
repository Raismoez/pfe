import { Component, OnInit } from '@angular/core';
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
export class MotdepasseComponent implements OnInit {
  // Champs du formulaire
  identifiant: string = '';
  nouveauMotDePasse: string = '';
  confirmationMotDePasse: string = '';
  
  // Messages d'erreur
  messageErreurIdentifiant: string = '';
  messageErreurMdp: string = '';
  messageErreurConfirmation: string = '';
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    
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
      return;
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
        alert("Mot de passe changé avec succès !");
        this.nouveauMotDePasse = '';
        this.confirmationMotDePasse = '';
        this.router.navigateByUrl("/");
      },
      error: (error) => {
        // Gestion des erreurs
        console.error('Erreur:', error);
        
        const errorMessage = error.message || "Une erreur s'est produite. Veuillez réessayer.";
        
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