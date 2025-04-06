import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../Service/auth.service';
import { ProfileService } from '../Service/profil.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Champs du formulaire
  identifiant: string = '';
  password: string = '';
  user: any;
  // Messages d'erreur
  messageErreurIdentifiant: string = '';
  messageErreurPassword: string = '';
  messageErreurGeneral: string='';
  
  // Constantes pour les rôles (à adapter selon votre système)
  private ROLE_ADMIN = 1;
  private ROLE_AGENT_COMMERCIAL = 2;
  private ROLE_AGENT_TECHNIQUE = 3;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}
  
  ngOnInit() {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('token');
    const identifiant = localStorage.getItem('identifiant');
    const idRole = localStorage.getItem('idRole');
    
    if (token && identifiant && idRole) {
      this.redirectBasedOnRole(parseInt(idRole));
    }
    
  }
  
  // Redirection vers la page de réinitialisation du mot de passe
  mdp() {
    this.router.navigateByUrl("motdepasse");
  }
  
  // Validation et envoi du formulaire
  onSubmit() {
    // Effacer les erreurs précédentes
    this.messageErreurIdentifiant = '';
    this.messageErreurPassword = '';
    
    // Validation de l'identifiant
    if (!this.identifiant) {
      this.messageErreurIdentifiant = "L'identifiant est requis.";
      return;
    }
    
    if (this.identifiant.length !== 10) {
      this.messageErreurIdentifiant = "L'identifiant doit avoir exactement 10 caractères.";
      return;
    }
    
    // Validation du mot de passe
    if (!this.password) {
      this.messageErreurPassword = "Le mot de passe est requis.";
      return;
    }
    
    if (this.password.length < 8) {
      this.messageErreurPassword = "Le mot de passe doit contenir au moins 8 caractères.";
      return;
    }
    
    // Utiliser le service d'authentification pour se connecter
    this.authService.login(
      this.identifiant,
      this.password
    ).subscribe({
      next: (response) => {
        // Succès
        console.log('Login successful:', response);
        this.loadUserProfile(this.identifiant)
        // Stocker l'identifiant dans le localStorage
        localStorage.setItem('identifiant', this.identifiant);
        
        // Rediriger en fonction du rôle
        this.redirectBasedOnRole(response.idRole);
      },
      error: (error) => {
        // Gestion des erreurs
        console.error('Login failed:', error);
        
        const errorMessage = error.message || "Identifiant ou mot de passe incorrect";
        
        if (errorMessage.includes("Identifiant") || errorMessage.includes("utilisateur")) {
          this.messageErreurIdentifiant = errorMessage;
        } else {
          this.messageErreurPassword = errorMessage;
        }
        if (error.status === 403) {
          this.messageErreurGeneral = errorMessage;
        }
      }
    });
  }
  loadUserProfile(identifiant: string) {
    console.log('identifiant',identifiant)
    console.log('Tentative de chargement du profil pour:', identifiant);
    this.profileService.getUserProfile(identifiant).subscribe({
      next: (data) => {
        console.log('Profil chargé avec succès:', data);
        sessionStorage.setItem("user",JSON.stringify(data))
        this.user = JSON.parse(sessionStorage.getItem("user") || '{}');
      },
    });
  }
  // Méthode pour rediriger en fonction du rôle
  private redirectBasedOnRole(role: number) {
    console.log('redirect test')
    setTimeout(() => {
      console.log('redirect by role')
    switch(role) {
      case this.ROLE_ADMIN:
        this.router.navigateByUrl('profilA');
        break;
      case this.ROLE_AGENT_COMMERCIAL:
      case this.ROLE_AGENT_TECHNIQUE:
        this.router.navigateByUrl('profilU');
        break;
      default:
        
    }
  }, 500);
  }
}