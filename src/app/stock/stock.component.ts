import { Component, OnInit } from '@angular/core';
import { StockService } from '../service/stock.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';

interface Stock {
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
  
  constructor(private router: Router, private stockService: StockService) {}

  ngOnInit() {
    this.loadStocks();
  }

  // Initialiser un stock vide
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

  // Charger tous les stocks
  loadStocks() {
    this.stockService.getAllStocks().subscribe(
      (data) => {
        this.stocks = data;
        this.filteredStocks = [...this.stocks];
      },
      (error) => {
        console.error('Erreur lors du chargement des stocks', error);
      }
    );
  }

  // Recherche dans le stock
  onSearch() {
    if (this.searchQuery.trim()) {
      this.filteredStocks = this.stocks.filter(stock =>
        stock.article.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        stock.constructeur.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredStocks = [...this.stocks];
    }
  }

  // Ouvrir le modal pour ajouter un stock
  openAddStockModal() {
    this.editMode = false;
    this.currentStock = this.initStock();
    this.showStockModal = true;
  }

  // Ouvrir le modal pour modifier un stock
  editStock(stock: Stock) {
    this.editMode = true;
    this.currentStock = { ...stock };
    this.showStockModal = true;
  }

  // Supprimer un stock avec confirmation
  deleteStock(stockId: number) {
    const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer cet article du stock ?');
    if (confirmation) {
      this.stockService.deleteStock(stockId).subscribe(
        () => {
          this.stocks = this.stocks.filter(s => s.id !== stockId);
          this.filteredStocks = [...this.stocks];
        },
        (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      );
    }
  }

  // Envoi du formulaire (ajout ou modification)
  onSubmitStockForm() {
    if (this.editMode) {
      this.stockService.updateStock(this.currentStock.id, this.currentStock).subscribe(
        (updatedStock) => {
          const index = this.stocks.findIndex(s => s.id === updatedStock.id);
          if (index !== -1) {
            this.stocks[index] = updatedStock;
            this.filteredStocks = [...this.stocks];
          }
          this.closeStockModal();
        },
        (error) => {
          console.error('Erreur lors de la mise à jour', error);
        }
      );
    } else {
      this.stockService.createStock(this.currentStock).subscribe(
        (newStock) => {
          this.stocks.push(newStock);
          this.filteredStocks = [...this.stocks];
          this.closeStockModal();
        },
        (error) => {
          console.error('Erreur lors de l’ajout du stock', error);
        }
      );
    }
  }

  // Fermer le modal
  closeStockModal() {
    this.showStockModal = false;
  }
}
