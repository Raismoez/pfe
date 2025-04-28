import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



// Interface pour la réservation
interface ReservationRequest {
  projectName: string;
  constructor: string;  // Champ constructeur
  category: string;
  article: string; // Article au lieu de catalogue
  date: string;
}

import { HeaderComponent } from '../components/header/header.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { Router } from '@angular/router';
import { ReservationService, Reservation } from '../services/reservation.service';


@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  showReservationModal: boolean = false;
  showSuccessMessage: boolean = false;
  showConfirmationModal: boolean = false;

  reservationData: Reservation = {
    nomDuProjet: '',
    constructeur: '',
    categorie: '',
    article: '',
    dateReservation: '',
    status: 'EN_ATTENTE'
  };

  constructors = ['cisco', 'huawei', 'fortinet'];
  categories = ['carteNIM', 'jarretiereOptique', 'moduleSFP', 'routeur', 'switch'];

  categoryArticles: { [key: string]: string[] } = {
    carteNIM: [
      'NIM-4G-LTE-GA',
      'NIM-1GE-CU-SFP',
      'Carte NIM FXS 4ports',
      'NIM-VDSL2/ADSL/2/2+'
    ],
    jarretiereOptique: [
      'Jarretière optique FC/LC 2m duplex',
      'Jarretière optique FC/LC 2m SM',
      'Jarretière optique LC/LC 2m duplex',
      'Jarretière optique LCPC/LCPC 2m SM'
    ],
    moduleSFP: [
      'GLC-BX-D',
      'GLC-BX-U',
      'GLC-FE-100BX-D= A',
      'GLC-FE-100BX-U= A',
      'Optical Transceiver(eSFP,1310nm,STM1,-15dBm~-8dBm,-31dBm,Singlemode,LC,15Km)',
      'Optical Transceiver,eSFP,FE,BIDI single-mode (module TX1310/RX1550,15K)',
      'Optical Transceiver,eSFP,GE,BIDI Single-mode Mudule (TX1310/RX1490,10K)'
    ],
    routeur: [
      'C1117-4P', 'C1117-4PWE', 'C1121X-8P', 'C891F-K9 avec support de la voix',
      'ISR4221/K9', 'ISR4321-V/K9', 'ISR4331-V/K9', 'ISR4351-V/K9',
      'C887VA-K9 avec service VOIP activé', 'C887VAG+7-K9',
      'C887VAG-4G-GA-K9', 'NE520-4G4Z-A', 'AR651', 'AR617VW-LTE4EA',
      'AR657W', 'FortiGate 80F', 'FortiGate 80F-DSL', 'FortiGate-80F-2R-3G4G-DSL'
    ],
    switch: ['NE520-4G4Z-A', 'S5735-L8T4S-A1']
  };

  get articlesForSelectedCategory(): string[] {
    return this.reservationData.categorie
      ? this.categoryArticles[this.reservationData.categorie] || []
      : [];
  }

  constructor(private router: Router, private reservationService: ReservationService) {}

  ngOnInit(): void {
    const today = new Date();
    this.reservationData.dateReservation = today.toISOString().split('T')[0];  // Format de date en string
  }

  openReservationModal() {
    this.showReservationModal = true;
  }

  closeReservationModal() {
    this.showReservationModal = false;
    this.resetForm();
  }

  resetForm() {
    this.reservationData = {
      nomDuProjet: '',
      constructeur: '',
      categorie: '',
      article: '',
      dateReservation: new Date().toISOString().split('T')[0],  // Format de date en string
      status: 'EN_ATTENTE'
    };
  }

  onCategoryChange() {
    this.reservationData.article = '';
  }

  submitReservation() {
    let formattedConstructor = '';
    switch (this.reservationData.constructeur) {
      case 'cisco': formattedConstructor = 'Cisco'; break;
      case 'huawei': formattedConstructor = 'Huawei'; break;
      case 'fortinet': formattedConstructor = 'Fortinet'; break;
      default: formattedConstructor = this.reservationData.constructeur;
    }

    let formattedCategory;
    switch (this.reservationData.categorie) {
      case 'carteNIM': formattedCategory = 'Carte NIM'; break;
      case 'jarretiereOptique': formattedCategory = 'Jarretière optique'; break;
      case 'moduleSFP': formattedCategory = 'Module SFP'; break;
      case 'routeur': formattedCategory = 'Routeur'; break;
      case 'switch': formattedCategory = 'Switch'; break;
      default: formattedCategory = this.reservationData.categorie;
    }

    const reservation: Reservation = {
      nomDuProjet: this.reservationData.nomDuProjet,
      constructeur: formattedConstructor,
      categorie: formattedCategory,
      article: this.reservationData.article,
      dateReservation: new Date(this.reservationData.dateReservation).toISOString().split('T')[0],  // Convertir la date en string
      status: 'EN_ATTENTE'
    };

    // Appeler la méthode pour créer la réservation
    this.reservationService.createReservation(reservation).subscribe({
      next: () => {
        this.closeReservationModal();
        this.showSuccessMessage = true;
        this.showConfirmationModal = true;

        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error: any) => {
        console.error('Erreur lors de la création de la réservation:', error);
      }
      
    });
  }

}
