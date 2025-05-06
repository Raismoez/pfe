import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-tableau-reservation',
  templateUrl: './tableau-reservation.component.html',
  styleUrls: ['./tableau-reservation.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, HeaderComponent]
})
export class TableauReservationComponent implements OnInit {
  reservationData: Reservation[] = [];
  filteredData: Reservation[] = [];
  filteredReservationData: Reservation[] = [];

  showReservationModal: boolean = false;
  showSuccessMessage: boolean = false;

  newReservation: Reservation = {
    nomDuProjet: '',
    constructeur: '',
    categorie: '',
    article: '',
    dateReservation: '',
    status: 'EN_ATTENTE'
  };

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  searchTerm: string = '';

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.reservationService.getAllReservations().subscribe({
      next: (items: Reservation[]) => {
        this.reservationData = items;
        this.filteredData = [...items];
        this.updatePagination();
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des réservations :', error);
      }
    });
  }

  updatePagination() {
    this.calculateTotalPages();
    this.applyPagination();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredReservationData = this.filteredData.slice(startIndex, endIndex);
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.filteredData = this.reservationData.filter(item =>
      item.article.toLowerCase().includes(this.searchTerm) ||
      item.constructeur.toLowerCase().includes(this.searchTerm) ||
      item.categorie.toLowerCase().includes(this.searchTerm)
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  openReservationModal() {
    this.showReservationModal = true;
  }

  closeReservationModal() {
    this.showReservationModal = false;
    this.resetReservationForm();
  }

  resetReservationForm() {
    this.newReservation = {
      nomDuProjet: '',
      constructeur: '',
      categorie: '',
      article: '',
      dateReservation: '',
      status: 'EN_ATTENTE'
    };
  }

  submitReservation() {
    if (!this.newReservation.nomDuProjet || !this.newReservation.constructeur ||
        !this.newReservation.categorie || !this.newReservation.article ||
        !this.newReservation.dateReservation) {
      return;
    }

    this.reservationService.createReservation(this.newReservation).subscribe({
      next: () => {
        this.closeReservationModal();
        this.showSuccessMessage = true;
        setTimeout(() => this.showSuccessMessage = false, 3000);
        this.loadReservations();
      },
      error: (error: any) => {
        console.error('Erreur lors de la création de la réservation:', error);
      }
    });
  }

  updateStatus(index: number, newStatus: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE') {
    const reservation = this.filteredReservationData[index];
    if (!reservation.id) return;

    if (newStatus === 'ANNULEE') {
      this.reservationService.cancelReservation(reservation.id).subscribe({
        next: () => {
          this.reservationService.deleteReservation(reservation.id!).subscribe({
            next: () => {
              this.reservationData = this.reservationData.filter(r => r.id !== reservation.id);
              this.filteredData = this.filteredData.filter(r => r.id !== reservation.id);
              this.filteredReservationData = this.filteredReservationData.filter(r => r.id !== reservation.id);
              this.updatePagination();
            },
            error: (err: any) => {
              console.error("Erreur lors de la suppression :", err);
            }
          });
        },
        error: (err: any) => {
          console.error("Erreur lors de l'annulation :", err);
        }
      });
    } else {
      const updatedReservation: Reservation = {
        ...reservation,
        status: newStatus
      };

      this.reservationService.updateReservation(reservation.id, updatedReservation).subscribe({
        next: (updated: Reservation) => {
          this.filteredReservationData[index].status = updated.status;

          if (newStatus === 'CONFIRMEE') {
            this.reservationService.confirmReservation(reservation.id!).subscribe({
              next: () => {
                console.log('Email de confirmation envoyé');
                this.showSuccessMessage = true;
                setTimeout(() => this.showSuccessMessage = false, 3000);
              },
              error: (err: any) => {
                console.error("Erreur lors de l'envoi de l'email de confirmation :", err);
              }
            });
          }

          this.showSuccessMessage = true;
          setTimeout(() => this.showSuccessMessage = false, 3000);
        },
        error: (err: any) => {
          console.error("Erreur lors de la mise à jour du statut :", err);
        }
      });
    }
  }
}
