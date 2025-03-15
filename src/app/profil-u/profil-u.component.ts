import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../Service/profil.service';
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
  public user = JSON.parse(sessionStorage.getItem("user") || '{}');

  originalProfile: any = {};
  
  isEditing = false;
  showPasswordForm = false;
  uploadingAvatar = false;
  showPasswordModal: boolean = false;

  toast = {
    show: false,
    message: ''
  };

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  passwordError: any = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  selectedFile: File | null = null;

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
  
  private apiBaseUrl = 'http://localhost:8080';

  loadUserProfile(identifiant: string) {
    console.log('Tentative de chargement du profil pour:', identifiant);
    this.profileService.getUserProfile(identifiant).subscribe({
      next: (data) => {
        console.log('Profil chargé avec succès:', data);
        
        // Ensure avatar URL is properly formatted
        let avatarUrl = data.avatarUrl || '';
        // If the URL is not empty and doesn't start with http or data: (for preview)
        if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
          // Ensure it has the full backend URL prefix
          avatarUrl = `${this.apiBaseUrl}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
        }
        
        this.userProfile = {
          ...data,
          role: this.getRoleName(data.idRole),
          avatarUrl: avatarUrl
        };
        this.originalProfile = {...this.userProfile};
      },
      error: (error) => {
        console.error('Erreur détaillée lors du chargement du profil:', error);
        this.showMessage('Erreur lors du chargement du profil');
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

  cancelEdit() {
    this.userProfile = {...this.originalProfile};
    this.isEditing = false;
    this.selectedFile = null;
  }

  onSubmit() {
    if (!this.userProfile.identifiant) {
      this.showMessage('Identifiant non disponible');
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
        this.showMessage('Profil mis à jour avec succès');
        this.originalProfile = {...this.userProfile};
        this.isEditing = false;
      },
      error: (error) => {
        this.showMessage('Erreur lors de la mise à jour du profil');
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
        this.uploadingAvatar = false;
        this.selectedFile = null;
        this.updateProfile();
      },
      error: (error) => {
        console.error('Détails de l\'erreur de téléchargement:', error);
        console.error('Statut:', error.status);
        console.error('Message d\'erreur:', error.message);
        
        this.showMessage('Erreur lors du téléchargement de l\'avatar');
        this.uploadingAvatar = false;
      }
    });
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
    } else if (this.newPassword.length < 6) {
      this.passwordError.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
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
        this.showMessage('Mot de passe modifié avec succès');
        this.togglePasswordForm();
      },
      error: (error) => {
        if (error.status === 401) {
          this.passwordError.currentPassword = 'Mot de passe actuel incorrect';
        } else {
          this.showMessage('Erreur lors de la modification du mot de passe');
        }
        console.error('Erreur de modification du mot de passe:', error);
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('identifiant');
    sessionStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  showMessage(message: string) {
    this.toast.message = message;
    this.toast.show = true;
    setTimeout(() => {
      this.toast.show = false;
    }, 3000);
  }
}