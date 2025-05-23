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
  
  // Ajout des propriétés pour les messages de notification
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';
  notificationTimeout: any = null;
  
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
        this.showNotificationMessage('Erreur lors du chargement des stocks', 'error');
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
    // Sauvegarder le nom de l'article avant de le supprimer
    const articleName = this.stockToDelete.article;
    
    this.stockService.deleteStock(this.stockToDelete.id).subscribe(
      () => {
        this.stocks = this.stocks.filter(s => s.id !== this.stockToDelete?.id);
        this.filteredStocks = this.filteredStocks.filter(s => s.id !== this.stockToDelete?.id);
        this.updatePagination();
        this.cancelDelete();
        
        // Afficher un message de confirmation avec le nom sauvegardé
        this.showNotificationMessage(`L'article ${articleName} a été supprimé avec succès`, 'success');
      },
      (error) => {
        console.error('Erreur lors de la suppression', error);
        this.cancelDelete();
        
        // Afficher un message d'erreur
        this.showNotificationMessage(`Erreur lors de la suppression: ${this.getErrorMessage(error)}`, 'error');
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
          
          // Afficher un message de confirmation
          this.showNotificationMessage(`L'article ${updatedStock.article} a été mis à jour avec succès`, 'success');
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          
          // Afficher un message d'erreur
          this.showNotificationMessage(`Erreur lors de la mise à jour: ${this.getErrorMessage(error)}`, 'error');
        }
      });
    } else {
      this.stockService.createStock(this.currentStock).subscribe({
        next: (newStock) => {
          this.stocks.push(newStock);
          this.applyFilters();
          this.closeStockModal();
          
          // Afficher un message de confirmation
          this.showNotificationMessage(`L'article ${newStock.article} a été ajouté avec succès`, 'success');
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout du stock", error);
          
          // Afficher un message d'erreur
          this.showNotificationMessage(`Erreur lors de l'ajout: ${this.getErrorMessage(error)}`, 'error');
        }
      });
    }
  }


  // Méthode d'aide pour extraire des messages d'erreur
  private getErrorMessage(error: any): string {
    return error.error?.message || error.message || "Une erreur s'est produite";
  }
}