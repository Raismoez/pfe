import { Component, OnInit } from '@angular/core';
import { StockService } from '../Service/stock.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';

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

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent, HeaderComponent],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent implements OnInit {
  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  searchQuery: string = '';
  showStockModal: boolean = false;
  editMode: boolean = false;
  currentStock: Stock = this.initStock();
  selectedCategory: string = '';
  sortBy: string = 'article';
  categories: string[] = ['Carte NIM', 'Jarretière optique', 'Module SFP', 'Routeur', 'Switch'];
  
  showDeleteConfirmation: boolean = false;
  stockToDelete: Stock | null = null;
  
  constructor(private router: Router, private stockService: StockService) {
    this.showStockModal = false;
    this.showDeleteConfirmation = false;
  }

  ngOnInit() {
    this.loadStocks();
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
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stocks', error);
      }
    });
  }

  applyFilters() {
  let filtered = [...this.stocks];
  console.log(filtered);

  // Apply search filter
  if (this.searchQuery.trim()) {
    const query = this.searchQuery.toLowerCase();
    filtered = filtered.filter(stock =>
      stock.categorie.toLowerCase().includes(query)
    );
  }

  // Vérifier si la catégorie sélectionnée correspond partiellement à des catégories existantes
  const categoriesExistantes = [...new Set(filtered.map(stock => stock.categorie))];

  if (this.selectedCategory && categoriesExistantes.some(cat => cat.includes(this.selectedCategory))) {
    filtered = filtered.filter(stock => stock.categorie.includes(this.selectedCategory));
  }

  // Apply sorting
  const sortField = this.sortBy.startsWith('-') ? this.sortBy.slice(1) : this.sortBy;
  const sortDirection = this.sortBy.startsWith('-') ? -1 : 1;

  filtered.sort((a, b) => {
    if (a[sortField as keyof Stock] < b[sortField as keyof Stock]) return -1 * sortDirection;
    if (a[sortField as keyof Stock] > b[sortField as keyof Stock]) return 1 * sortDirection;
    return 0;
  });

  this.filteredStocks = filtered;
}

  

  onSearch() {
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

  // Fermer le modal
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
          this.filteredStocks = [...this.stocks];
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
            this.filteredStocks = [...this.stocks];
          }
          this.closeStockModal();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          // Afficher un message d'erreur à l'utilisateur
          alert("Erreur lors de la mise à jour: " + this.getErrorMessage(error));
        }
      });
    } else {
      this.stockService.createStock(this.currentStock).subscribe({
        next: (newStock) => {
          this.stocks.push(newStock);
          this.filteredStocks = [...this.stocks];
          this.closeStockModal();
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout du stock", error);
          // Afficher un message d'erreur à l'utilisateur
          alert("Erreur lors de l'ajout: " + this.getErrorMessage(error));
        }
      });
    }
  }

  // Méthode d'aide pour extraire des messages d'erreur
  private getErrorMessage(error: any): string {
    return error.error?.message || error.message || "Une erreur s'est produite";
  }
}