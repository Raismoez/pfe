import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { User, UserService } from '../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule,SidebarComponent,HeaderComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';
  public user = localStorage.getItem("identifiant") || '{}';
  showUserModal: boolean = false;
  editMode: boolean = false;
  currentUser: User = {
    id: 0,
    identifiant: '',
    nomUtilisateur: '',
    email: '',
    idRole: '',
    statut: 'Actif',
    password: ''
  };

  // Ajout des propriétés pour les messages de notification
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';
  notificationTimeout: any = null;

  showDeleteConfirmation: boolean = false;
  userToDelete: User | null = null;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    console.log(this.user);
    this.loadUsers();
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

  // Fonction pour récupérer le rôle d'un utilisateur
  getRole(idRole: any): string {
    if (idRole == 1) return 'Admin';
    if (idRole == 2) return 'Agent commercial';
    if (idRole == 3) return 'Agent technique';
    return 'Rôle inconnu';
  }

  // Fonction pour charger tous les utilisateurs
  loadUsers() {
    this.userService.getAllUsers().subscribe(
      (data) => {
        this.users = data;
        this.filteredUsers = [...this.users];
      },
      (error) => {
        console.error('Erreur lors du chargement des utilisateurs', error);
        this.showNotificationMessage('Erreur lors du chargement des utilisateurs', 'error');
      }
    );
  }

  // Fonction pour rechercher les utilisateurs
  onSearch() {
    if (this.searchQuery.trim()) {
      this.userService.searchUsers(this.searchQuery).subscribe(
        (data) => {
          this.filteredUsers = data;
        },
        (error) => {
          console.error('Erreur lors de la recherche', error);
          this.showNotificationMessage('Erreur lors de la recherche d\'utilisateurs', 'error');
        }
      );
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  // Ouvrir la modal pour ajouter un utilisateur
  openAddUserModal() {
    this.editMode = false;
    this.currentUser = {
      id: 0,
      identifiant: '',
      nomUtilisateur: '',
      email: '',
      idRole: '',
      statut: 'Actif',
      password: ''
    };
    this.showUserModal = true;
  }

  // Ouvrir la modal pour modifier un utilisateur
  editUser(user: User) {
    this.editMode = true;
    this.currentUser = { ...user };
    this.showUserModal = true;
  }

  // Bloquer ou débloquer un utilisateur
  blockUser(userId: number) {
    this.userService.toggleUserStatus(userId).subscribe(
      (updatedUser) => {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filteredUsers = [...this.users];
          const action = updatedUser.statut === 'Actif' ? 'activé' : 'désactivé';
          this.showNotificationMessage(`L'utilisateur ${updatedUser.nomUtilisateur} a été ${action} avec succès`, 'success');
        }
      },
      (error) => {
        console.error('Erreur lors du changement de statut', error);
        this.showNotificationMessage(`Erreur lors du changement de statut: ${this.getErrorMessage(error)}`, 'error');
      }
    );
  }

  // Soumettre le formulaire d'utilisateur pour création ou mise à jour
  onSubmitUserForm() {
    console.log('Envoi du formulaire utilisateur:', this.currentUser);

    if (this.editMode) {
      this.userService.updateUser(this.currentUser.id, this.currentUser).subscribe(
        (updatedUser) => {
          console.log('Utilisateur mis à jour avec succès:', updatedUser);
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.filteredUsers = [...this.users];
          }
          this.closeUserModal();
          this.showNotificationMessage(`L'utilisateur ${updatedUser.nomUtilisateur} a été mis à jour avec succès`, 'success');
        },
        (error) => {
          console.error('Erreur détaillée lors de la mise à jour:', error);
          this.showNotificationMessage(`Erreur lors de la mise à jour: ${this.getErrorMessage(error)}`, 'error');
        }
      );
    } else {
      console.log('Tentative de création d\'utilisateur avec:', this.currentUser);
      this.userService.createUser(this.currentUser).subscribe(
        (newUser) => {
          console.log('Utilisateur créé avec succès:', newUser);
          this.users.push(newUser);
          this.filteredUsers = [...this.users];
          this.closeUserModal();
          this.showNotificationMessage(`L'utilisateur ${newUser.nomUtilisateur} a été créé avec succès`, 'success');
        },
        (error) => {
          console.error('Erreur détaillée lors de la création:', error);
          this.showNotificationMessage(`Erreur lors de la création: ${this.getErrorMessage(error)}`, 'error');
        }
      );
    }
  }

  closeUserModal() {
    this.showUserModal = false;
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteConfirmation = true;
  }

  deleteUserConfirmed(): void {
    if (this.userToDelete) {
      // Sauvegarder le nom d'utilisateur avant de le supprimer
      const userName = this.userToDelete.nomUtilisateur;
      
      this.userService.deleteUser(this.userToDelete.id).subscribe(
        () => {
          this.users = this.users.filter(u => u.id !== this.userToDelete?.id);
          this.filteredUsers = [...this.users];
          this.cancelDelete();
          this.showNotificationMessage(`L'utilisateur ${userName} a été supprimé avec succès`, 'success');
        },
        (error) => {
          console.error('Erreur lors de la suppression', error);
          this.cancelDelete();
          this.showNotificationMessage(`Erreur lors de la suppression: ${this.getErrorMessage(error)}`, 'error');
        }
      );
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.userToDelete = null;
  }

  // Méthode d'aide pour extraire des messages d'erreur
  private getErrorMessage(error: any): string {
    return error.error?.message || error.message || "Une erreur s'est produite";
  }
}