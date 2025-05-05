import { Component, OnInit, OnDestroy } from '@angular/core';
import { StockService, ReservationDetails } from '../services/stock.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';
import { NotificationComponent } from '../notification/notification.component';
import { Subscription } from 'rxjs';



export interface Stock {
  id: number;
  article: string;
  constructeur: string;
  categorie: string;
  date: string;
  quantite: number;
  endOfSale: string;
  endOfSupport: string;
}

export interface Reservation {
  id: number;
  stockId: number;
  quantity: number;
  date: string;
  comment?: string;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule, HttpClientModule, SidebarComponent, HeaderComponent, NotificationComponent],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent implements OnInit, OnDestroy {
  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  displayedStocks: Stock[] = []; // Stocks affichés sur la page courante
  searchQuery: string = '';
  showStockModal: boolean = false;
  editMode: boolean = false;
  currentStock: Stock = this.initStock();
  selectedCategory: string = '';
  sortBy: string = 'article';
  categories: string[] = ['Carte NIM', 'Jarretière optique', 'Module SFP', 'Routeur', 'Switch'];
  
  showDeleteConfirmation: boolean = false;
  stockToDelete: Stock | null = null;
  
  // Propriétés pour la réservation
  showReservationModal: boolean = false;
  stockToReserve: Stock | null = null;
  reservationQuantity: number = 1;
  reservationDate: string = '';
  reservationComment: string = '';
  
  // Nouvelle propriété pour le modal de confirmation de réservation
  showReservationConfirmModal: boolean = false;
  
  // Nouvelle propriété pour stocker les détails de réservation
  reservationDetails: ReservationDetails | null = null;
  
  // Abonnement pour nettoyer lors de la destruction
  private reservationSubscription: Subscription | null = null;
  
  // Propriétés de pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  public user: any;
  public isAdmin: boolean = false;
  public isCommercialAgent: boolean = false;
  public isTechnicalAgent: boolean = false;
  
  // Role constants from login component
  private readonly ROLE_ADMIN = 1;
  private readonly ROLE_AGENT_COMMERCIAL = 2;
  private readonly ROLE_AGENT_TECHNIQUE = 3;

  
  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private stockService: StockService
  ) {
    this.showStockModal = false;
    this.showDeleteConfirmation = false;
    this.showReservationModal = false;
    this.showReservationConfirmModal = false;
  }

  ngOnInit() {
    this.loadStocks();
    
    // S'abonner aux détails de réservation
    this.reservationSubscription = this.stockService.reservationDetails$.subscribe(details => {
      this.reservationDetails = details;
      
      // Si des détails existent et si le paramètre d'URL indique qu'il faut afficher le modal
      this.route.queryParams.subscribe(params => {
        if (params['showReservationConfirm'] === 'true' && this.reservationDetails) {
          this.showReservationConfirmModal = true;
        }
      });
    });
    
    // Initialiser la date de réservation à aujourd'hui
    const today = new Date();
    this.reservationDate = today.toISOString().split('T')[0];
    
    this.user = JSON.parse(sessionStorage.getItem("user") || '{}');
    
    // Get role from localStorage (as a fallback if user object doesn't have role)
    const roleId = this.user.idRole || parseInt(localStorage.getItem('idRole') || '0');
    
    // Set role flags
    this.isAdmin = roleId === this.ROLE_ADMIN;
    this.isCommercialAgent = roleId === this.ROLE_AGENT_COMMERCIAL;
    this.isTechnicalAgent = roleId === this.ROLE_AGENT_TECHNIQUE;
  }
  
  ngOnDestroy() {
    // Nettoyer l'abonnement
    if (this.reservationSubscription) {
      this.reservationSubscription.unsubscribe();
    }
  }

  private initStock(): Stock {
    return {
      id: 0,
      article: '',
      constructeur: '',
      categorie: '',
      date: '',
      quantite: 0,
      endOfSale: '',
      endOfSupport: ''
    };
  }

  getTotalQuantity(): number {
    return this.stocks.reduce((total, stock) => total + stock.quantite, 0);
  }

  getEndOfSupportCount(): number {
    const today = new Date();
    return this.stocks.filter(stock => {
      if (!stock.endOfSupport) return false;
      return new Date(stock.endOfSupport) <= today;
    }).length;
  }
  
  getEndOfSaleCount(): number {
    const today = new Date();
    return this.stocks.filter(stock => {
      if (!stock.endOfSale) return false;
      return new Date(stock.endOfSale) <= today;
    }).length;
  }

  loadStocks() {
    this.stockService.getAllStocks().subscribe({
      next: (data) => {
        this.stocks = data;
        this.filteredStocks = [...data];
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stocks', error);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.stocks];

    // Appliquer le filtre de recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(stock =>
        stock.article.toLowerCase().includes(query) ||
        stock.constructeur.toLowerCase().includes(query) ||
        stock.categorie.toLowerCase().includes(query)
      );
    }

    // Appliquer le filtre de catégorie
    if (this.selectedCategory) {
      filtered = filtered.filter(stock => stock.categorie.includes(this.selectedCategory));
    }

    // Appliquer le tri
    const sortField = this.sortBy.startsWith('-') ? this.sortBy.slice(1) : this.sortBy;
    const sortDirection = this.sortBy.startsWith('-') ? -1 : 1;

    filtered.sort((a, b) => {
      if (a[sortField as keyof Stock] < b[sortField as keyof Stock]) return -1 * sortDirection;
      if (a[sortField as keyof Stock] > b[sortField as keyof Stock]) return 1 * sortDirection;
      return 0;
    });

    this.filteredStocks = filtered;
    
    // Réinitialiser à la première page après filtrage
    this.currentPage = 1;
    this.updatePagination();
  }

  // Mettre à jour la pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredStocks.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    
    // S'assurer que la page courante est valide
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    // Calculer les indices de début et de fin
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredStocks.length);
    
    // Mettre à jour les stocks affichés
    this.displayedStocks = this.filteredStocks.slice(startIndex, endIndex);
  }
  
  // Aller à la page suivante
  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  // Aller à la page précédente
  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  onSearch() {
    this.currentPage = 1; // Retour à la première page lors d'une nouvelle recherche
    this.applyFilters();
  }

  // Ouvrir le modal pour ajouter un stock
  openAddStockModal() {
    console.log('Opening add stock modal');
    this.editMode = false;
    this.currentStock = this.initStock();
    this.showStockModal = true;
  }

  // Ouvrir le modal pour modifier un stock
  editStock(stock: Stock) {
    console.log('Opening edit stock modal');
    this.editMode = true;
    this.currentStock = { ...stock };
    this.showStockModal = true;
  }

  // Fermer le modal de stock
  closeStockModal() {
    console.log('Closing modal');
    this.showStockModal = false;
  }

  // Afficher la confirmation de suppression
  confirmDelete(stock: Stock): void {
    this.stockToDelete = stock;
    this.showDeleteConfirmation = true;
  }

  // Confirmer la suppression
  deleteStockConfirmed(): void {
    if (this.stockToDelete) {
      this.stockService.deleteStock(this.stockToDelete.id).subscribe(
        () => {
          this.stocks = this.stocks.filter(s => s.id !== this.stockToDelete?.id);
          this.filteredStocks = this.filteredStocks.filter(s => s.id !== this.stockToDelete?.id);
          this.updatePagination();
          this.cancelDelete();
        },
        (error) => {
          console.error('Erreur lors de la suppression', error);
          this.cancelDelete();
        }
      );
    }
  }

  // Annuler la suppression
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.stockToDelete = null;
  }

  // Envoi du formulaire (ajout ou modification)
  onSubmitStockForm() {
    console.log('Form submitted', this.currentStock);
    if (this.editMode) {
      this.stockService.updateStock(this.currentStock.id, this.currentStock).subscribe({
        next: (updatedStock) => {
          const index = this.stocks.findIndex(s => s.id === updatedStock.id);
          if (index !== -1) {
            this.stocks[index] = updatedStock;
            this.applyFilters();
          }
          this.closeStockModal();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          alert("Erreur lors de la mise à jour: " + this.getErrorMessage(error));
        }
      });
    } else {
      this.stockService.createStock(this.currentStock).subscribe({
        next: (newStock) => {
          this.stocks.push(newStock);
          this.applyFilters();
          this.closeStockModal();
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout du stock", error);
          alert("Erreur lors de l'ajout: " + this.getErrorMessage(error));
        }
      });
    }
  }
  
// Ouvrir le modal de réservation
openReservationModal(stock?: Stock): void {
  // Vérifier s'il y a des détails de réservation disponibles dans le service
  const reservationDetails = this.stockService.getReservationDetails();
  
  if (reservationDetails) {
    console.log('Détails de réservation trouvés:', reservationDetails);
    // Si des détails de réservation existent, afficher le modal de confirmation
    this.reservationDetails = reservationDetails;
    this.showReservationConfirmModal = true;
    return;
  } else {
    console.log('Aucun détail de réservation trouvé');
  }
  
  // Sinon, continuer avec le comportement existant
  if (stock) {
    this.stockToReserve = stock;
  } else if (this.stocks.length > 0) {
    // Par défaut, sélectionnez le premier stock si aucun n'est spécifié
    this.stockToReserve = this.stocks[0];
  } else {
    alert("Aucun stock disponible pour réservation");
    return;
  }
  
  this.reservationQuantity = 1;
  this.reservationDate = new Date().toISOString().split('T')[0];
  this.reservationComment = '';
  this.showReservationModal = true;
}
  // Confirmer la réservation depuis le modal de confirmation
  confirmReservation(): void {
    if (!this.reservationDetails) return;
    
    console.log('Réservation confirmée:', this.reservationDetails);
    
    // Ici vous effectueriez l'action réelle de réservation
    // Par exemple, mettre à jour le stock, enregistrer dans la base de données, etc.
    
    // Trouver l'article correspondant dans le stock (si nécessaire)
    const stockItem = this.stocks.find(s => 
      s.article.toLowerCase() === this.reservationDetails?.article.toLowerCase() &&
      s.constructeur.toLowerCase() === this.reservationDetails?.constructeur.toLowerCase() &&
      s.categorie.toLowerCase() === this.reservationDetails?.categorie.toLowerCase()
    );
    
    if (stockItem) {
      // Vous pourriez par exemple mettre à jour la quantité ici
      // stockItem.quantite -= 1; // Diminuer le stock
      
      // Et mettre à jour le stock en base de données
      // this.stockService.updateStock(stockItem.id, stockItem).subscribe(...);
    }
    
    // Afficher un message de confirmation
    alert(`Réservation pour le projet ${this.reservationDetails.nomProjet} effectuée avec succès.`);
    
    // Fermer le modal et effacer les détails
    this.showReservationConfirmModal = false;
    this.stockService.clearReservationDetails();
  }

  // Annuler la réservation
  cancelReservation(): void {
    this.showReservationConfirmModal = false;
    this.stockService.clearReservationDetails();
  }

  // Méthode d'aide pour extraire des messages d'erreur
  private getErrorMessage(error: any): string {
    return error.error?.message || error.message || "Une erreur s'est produite";
  }
}