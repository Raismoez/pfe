import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../components/header/header.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

// Interface pour la réservation
interface ReservationRequest {
  projectName: string;
  constructor: string;  // Champ constructeur
  category: string;
  article: string; // Article au lieu de catalogue
  date: string;
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  showReservationModal: boolean = false;
  showSuccessMessage: boolean = false; // Propriété pour le message de succès

  // Initialisation des données de réservation
  reservationData: ReservationRequest = {
    projectName: '',
    constructor: '',
    category: '',
    article: '',
    date: ''
  };

  // Constructeurs disponibles (Cisco, Huawei, Fortinet)
  constructors = ['Cisco', 'Huawei', 'Fortinet'];

  // Catégories disponibles
  categories = ['Carte NIM', 'Jarretière optique', 'Module SFP', 'Routeur', 'Switch'];

  constructor() {}

  ngOnInit(): void {}

  // Ouvrir le modal
  openReservationModal() {
    this.showReservationModal = true;
  }

  // Fermer le modal
  closeReservationModal() {
    this.showReservationModal = false;
    this.reservationData = {
      projectName: '',
      constructor: '',
      category: '',
      article: '',
      date: ''
    };
  }

  // Soumettre la réservation
  submitReservation() {
    this.closeReservationModal();
    this.showSuccessMessage = true; // Afficher le message de succès
    
    // Masquer le message après 3 secondes
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }
}
