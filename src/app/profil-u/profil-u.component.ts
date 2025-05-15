import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../services/profil.service';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-profilu',
  standalone: true,
  imports: [CommonModule, FormsModule,SidebarComponent,HeaderComponent],
  templateUrl: './profil-u.component.html',
  styleUrls: ['./profil-u.component.css']
})
export class ProfilUComponent implements OnInit {
    userProfile: any = {
    identifiant: '',
    nomUtilisateur: '',
    email: '',
    role: '',
    avatarUrl: ''
  };

  originalProfile: any = {};
  
  isEditing = false;
  showPasswordForm = false;
  uploadingAvatar = false;
  showPasswordModal: boolean = false;

 
  
  // Ajout des propriétés pour les messages de notification
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';
  notificationTimeout: any = null;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  passwordError: any = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  selectedFile: File | null = null;
  user: any;

  constructor(
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // Ajoutez des logs pour déboguer
    const identifiant = localStorage.getItem('identifiant');
    console.log('Identifiant trouvé:', identifiant);
    
    if (identifiant) {
      this.loadUserProfile(identifiant);
    } else {
      console.log('Aucun identifiant trouvé, redirection vers login');
      this.router.navigate(['/']);
    }
  }
  
  ngOnDestroy() {
    // Nettoyer le timeout de notification si existant
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  // Méthode pour afficher les notifications
  showNotificationMessage(message: string, type: 'success' | 'error' | 'warning' = 'success', duration: number = 5000) {
    // Annuler tout timeout existant
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }
    
    // Définir le message et afficher la notification
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    console.log(`Notification affichée: "${message}" de type ${type} pour ${duration}ms`);
    
    // Masquer automatiquement après la durée spécifiée
    if (duration > 0) {
      this.notificationTimeout = setTimeout(() => {
        console.log(`Fermeture de la notification: "${message}"`);
        this.showNotification = false;
      }, duration);
    }
  }
  
  private apiBaseUrl = 'http://localhost:8080';

  loadUserProfile(identifiant: string) {
    console.log('Tentative de chargement du profil pour:', identifiant);
    this.profileService.getUserProfile(identifiant).subscribe({
      next: (data) => {
        this.userProfile = {
          ...data,
          role: this.getRoleName(data.idRole),
          // avatarUrl: avatarUrl
        };
        this.originalProfile = {...this.userProfile};
      },
      error: (error) => {
        console.error('Erreur détaillée lors du chargement du profil:', error);
        this.showNotificationMessage('Erreur lors du chargement du profil', 'error');
      }
    });
  }

  getRoleName(idRole: number): string {
    const roles: {[key: number]: string} = {
      1: 'Administrateur',
      2: 'Agent Commercial',
      3: 'Agent technique'
    };
    return roles[idRole] || 'Administrateur';
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    
    // Si on annule l'édition, on restaure les valeurs originales
    if (!this.isEditing) {
      this.cancelEdit();
    }
  }
  
  togglePasswordModal() {
    this.showPasswordModal = !this.showPasswordModal;
    // Réinitialiser les erreurs et les champs si on ferme le modal
    if (!this.showPasswordModal) {
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.passwordError = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }
  }

  cancelEdit() {
    this.userProfile = {...this.originalProfile};
    this.isEditing = false;
    this.selectedFile = null;
  }

  onSubmit() {
    if (!this.userProfile.identifiant) {
      this.showNotificationMessage('Identifiant non disponible', 'error');
      return;
    }

    // Si un fichier a été sélectionné, téléchargez-le d'abord
    if (this.selectedFile) {
      this.uploadAvatar();
    } else {
      this.updateProfile();
    }
  }

  updateProfile() {
    const updateData = {
      email: this.userProfile.email,
      nomUtilisateur: this.userProfile.nomUtilisateur,
      avatarUrl: this.userProfile.avatarUrl
    };

    this.profileService.updateUserProfile(this.userProfile.identifiant, updateData).subscribe({
      next: () => {
        this.showNotificationMessage('Profil mis à jour avec succès', 'success');
        this.originalProfile = {...this.userProfile};
        this.isEditing = false;
        
        // Attendre que la notification soit visible pendant quelques secondes avant de recharger la page
        setTimeout(() => {
          window.location.reload();
        }, 2000); // Recharge la page après 2 secondes
      },
      error: (error) => {
        this.showNotificationMessage('Erreur lors de la mise à jour du profil', 'error');
        console.error('Erreur de mise à jour:', error);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Afficher un aperçu de l'image
      const reader = new FileReader();
      reader.onload = () => {
        this.userProfile.avatarUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadAvatar() {
    if (!this.selectedFile) {
      this.updateProfile();
      return;
    }
  
    this.uploadingAvatar = true;
    
    console.log('Démarrage du téléchargement de l\'avatar pour:', this.userProfile.identifiant);
    console.log('Détails du fichier:', {
      name: this.selectedFile.name,
      type: this.selectedFile.type,
      size: this.selectedFile.size
    });
    
    this.profileService.uploadAvatar(this.userProfile.identifiant, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Réponse du téléchargement:', response);
        
        // Ensure the returned avatarUrl has the correct base URL
        let avatarUrl = response.avatarUrl || '';
        if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
          avatarUrl = `${this.apiBaseUrl}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
        }
        
        this.userProfile.avatarUrl = avatarUrl;
        console.log(this.userProfile)
        sessionStorage.removeItem('user');
        sessionStorage.setItem('user',JSON.stringify(this.userProfile))
        this.uploadingAvatar = false;
        this.selectedFile = null;
        this.updateProfile();
        
      },
      error: (error) => {
        console.error('Détails de l\'erreur de téléchargement:', error);
        console.error('Statut:', error.status);
        console.error('Message d\'erreur:', error.message);
        
        this.showNotificationMessage('Erreur lors du téléchargement de l\'avatar', 'error');
        this.uploadingAvatar = false;
      }
    });
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.resetPasswordForm();
    }
  }

  resetPasswordForm() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  validatePasswordForm(): boolean {
    let isValid = true;
    this.passwordError = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!this.currentPassword) {
      this.passwordError.currentPassword = 'Le mot de passe actuel est requis';
      isValid = false;
    }

    if (!this.newPassword) {
      this.passwordError.newPassword = 'Le nouveau mot de passe est requis';
      isValid = false;
    } else if (this.newPassword.length < 8) {
      this.passwordError.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
      isValid = false;
    }

    if (!this.confirmPassword) {
      this.passwordError.confirmPassword = 'La confirmation du mot de passe est requise';
      isValid = false;
    } else if (this.newPassword !== this.confirmPassword) {
      this.passwordError.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    return isValid;
  }

  savePassword() {
    if (!this.validatePasswordForm()) {
      return;
    }

    const passwordData = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };
    console.log('Données envoyées:', passwordData);

    this.profileService.changePassword(this.userProfile.identifiant, passwordData).subscribe({
      next: () => {
        this.showNotificationMessage('Mot de passe modifié avec succès', 'success');
        this.togglePasswordModal();
      },
      error: (error) => {
        if (error.status === 401) {
          this.passwordError.currentPassword = 'Mot de passe actuel incorrect';
        } else {
          this.showNotificationMessage('Erreur lors de la modification du mot de passe', 'error');
        }
        console.error('Erreur de modification du mot de passe:', error);
      }
    });
  }

  
  showMessage(message: string) {
    this.showNotificationMessage(message, message.includes('Erreur') ? 'error' : 'success');
  }
}