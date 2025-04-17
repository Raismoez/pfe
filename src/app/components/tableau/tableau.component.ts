import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService, StockItem } from '../../services/dashboard.service';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-tableau',
  templateUrl: './tableau.component.html',
  styleUrls: ['./tableau.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, HeaderComponent]
})
export class TableauComponent implements OnInit {
  stockData: StockItem[] = [];          // Données originales complètes
  filteredData: StockItem[] = [];       // Données filtrées (par recherche)
  filteredStockData: StockItem[] = [];  
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; 
  totalPages: number = 1;
  searchTerm: string = '';

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loadStockItems();
  }

  loadStockItems() {
    this.dashboardService.getStockItems().subscribe({
      next: (items) => {
        console.log('Stock Items Fetched:', items);
        this.stockData = items;
        this.filteredData = [...items]; // Copie initiale pour le filtrage
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error fetching stock items:', error);
      },
      complete: () => {
        console.log('Stock items fetch completed');
      }
    });
  }

  // Méthode principale pour mettre à jour la pagination
  updatePagination() {
    this.calculateTotalPages();
    this.applyPagination();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    // S'assurer que currentPage est valide
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredStockData = this.filteredData.slice(startIndex, endIndex);
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
    
    // Filtrer les données originales
    this.filteredData = this.stockData.filter(item => 
      item.article.toLowerCase().includes(this.searchTerm) ||
      item.constructeur.toLowerCase().includes(this.searchTerm) ||
      item.categorie.toLowerCase().includes(this.searchTerm)
    );
    
    // Réinitialiser à la première page
    this.currentPage = 1;
    
    // Mettre à jour la pagination avec les nouvelles données filtrées
    this.updatePagination();
  }

  // Méthodes d'analyse des données (inchangées)
  analyzeStockTrend(itemId: string): { trend: 'increasing' | 'decreasing' | 'stable', percentage: number } {
    const item = this.stockData.find(i => i.article === itemId);
    if (!item) return { trend: 'stable', percentage: 0 };
    
    const quantities = [
      item.quantite,
      item.quantiteM2,
      item.quantiteM3,
      item.quantiteM4,
      item.quantiteM5,
      item.quantiteM6
    ].filter(q => q !== undefined && q !== null) as number[];
    
    if (quantities.length < 2) return { trend: 'stable', percentage: 0 };
    
    const oldest = quantities[quantities.length - 1];
    const newest = quantities[0];
    const diff = newest - oldest;
    const percentage = Math.round((diff / oldest) * 100);
    
    if (percentage > 5) return { trend: 'increasing', percentage };
    if (percentage < -5) return { trend: 'decreasing', percentage: Math.abs(percentage) };
    return { trend: 'stable', percentage: 0 };
  }

  getLowStockItems(): StockItem[] {
    return this.stockData.filter(item => item.quantite < 20);
  }

  getExpiringItems(): StockItem[] {
    const today = new Date();
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    
    return this.stockData.filter(item => {
      if (item.endOfSale === 'Not announced') return false;
      const [day, month, year] = item.endOfSale.split('-');
      const endOfSale = new Date(`${month} ${day} ${year}`);
      return endOfSale <= threeMonths && endOfSale >= today;
    });
  }
}