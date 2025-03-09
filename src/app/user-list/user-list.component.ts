import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { User, UserService } from '../Service/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';
  
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
  
  constructor(private userService: UserService) {}
  
  ngOnInit() {
    this.loadUsers();
  }
  
  loadUsers() {
    this.userService.getAllUsers().subscribe(
      (data) => {
        this.users = data;
        this.filteredUsers = [...this.users];
      },
      (error) => {
        console.error('Erreur lors du chargement des utilisateurs', error);
      }
    );
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.userService.searchUsers(this.searchQuery).subscribe(
        (data) => {
          this.filteredUsers = data;
        },
        (error) => {
          console.error('Erreur lors de la recherche', error);
        }
      );
    } else {
      this.filteredUsers = [...this.users];
    }
  }
  
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
  
  editUser(user: User) {
    this.editMode = true;
    this.currentUser = { ...user };
    this.showUserModal = true;
  }
  
  deleteUser(userId: number) {
    this.userService.deleteUser(userId).subscribe(
      () => {
        this.users = this.users.filter(u => u.id !== userId);
        this.filteredUsers = [...this.users];
      },
      (error) => {
        console.error('Erreur lors de la suppression', error);
      }
    );
  }
  
  blockUser(userId: number) {
    this.userService.toggleUserStatus(userId).subscribe(
      (updatedUser) => {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filteredUsers = [...this.users];
        }
      },
      (error) => {
        console.error('Erreur lors du changement de statut', error);
      }
    );
  }
  
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
        },
        (error) => {
          console.error('Erreur détaillée lors de la mise à jour:', error);
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
        },
        (error) => {
          console.error('Erreur détaillée lors de la création:', error);
        }
      );
    }
  }
  
  closeUserModal() {
    this.showUserModal = false;
  }
  
  logout(event: Event) {
    event.preventDefault();
    // Ajouter la logique de déconnexion ici
  }
}