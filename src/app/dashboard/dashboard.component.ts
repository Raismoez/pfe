import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { DashboardService, StockItem } from '../Service/dashboard.service';



interface StockMovement {
  month: string;
  totalQuantity: number;
}

interface SummaryCard {
  title: string;
  value: number | string;
  icon: string;
  valueClass?: string;
  trendClass?: string;
  trendIcon?: string;
  trendPercentage?: number;
}

@Component({
  selector: 'app-enhanced-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, HeaderComponent]
})
export class DashboardComponent implements OnInit {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('manufacturerChart') manufacturerChartRef!: ElementRef;
  @ViewChild('stockEvolutionChart') stockEvolutionChartRef!: ElementRef;

  stockData: StockItem[] = [];
  summaryCards: SummaryCard[] = [];
  filteredStockData: StockItem[] = [];
  
  categoryChart: Chart | null = null;
  manufacturerChart: Chart | null = null;
  stockEvolutionChart: Chart | null = null;

  isDarkMode = false;

  constructor(private dashboardService: DashboardService) {
    this.filteredStockData = [...this.stockData];
  }

  ngOnInit() {
    this.loadDashboardMetrics();
    this.loadChartData();
    this.loadStockItems();
  }
  

  ngAfterViewInit() {
    // Chart creation is now handled in loadChartData()
  }
  loadStockItems() {
    this.dashboardService.getStockItems().subscribe({
      next: (items) => {
        console.log('Stock Items Fetched:', items); // Debug log
        this.stockData = items;
        this.filteredStockData = [...items];
      },
      error: (error) => {
        console.error('Error fetching stock items:', error); // Error log
      },
      complete: () => {
        console.log('Stock items fetch completed'); // Completion log
      }
    });
  }

  loadDashboardMetrics() {
    this.dashboardService.getDashboardMetrics().subscribe(metrics => {
      this.summaryCards = [
        {
          title: 'Total Articles',
          value: metrics.totalArticles,
          icon: 'fas fa-box',
          trendPercentage: this.calculateTrend('articles'),
          trendClass: this.calculateTrend('articles') >= 0 ? 'text-green-500' : 'text-red-500',
          trendIcon: this.calculateTrend('articles') >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'
        },
        {
          title: 'Quantité Totale',
          value: metrics.totalQuantity,
          icon: 'fas fa-cubes',
          trendPercentage: this.calculateTrend('quantity'),
          trendClass: this.calculateTrend('quantity') >= 0 ? 'text-blue-500' : 'text-red-500',
          trendIcon: this.calculateTrend('quantity') >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'
        },
        {
          title: 'Stock Faible',
          value: `${metrics.lowStockItemsCount} articles`,
          icon: 'fas fa-exclamation-triangle',
          valueClass: 'text-orange-500',
          trendPercentage: this.calculateTrend('lowStock'),
          trendClass: 'text-orange-500',
          trendIcon: 'fa-arrow-up'
        },
        {
          title: 'Fin de Vente Proche',
          value: `${metrics.expiringItemsCount} articles`,
          icon: 'fas fa-bell',
          valueClass: 'text-red-500',
          trendPercentage: this.calculateTrend('expiringItems'),
          trendClass: 'text-red-500',
          trendIcon: 'fa-arrow-up'
        }
      ];
    });
  }

  loadChartData() {
    // Category Distribution Chart
    this.dashboardService.getCategoryDistribution().subscribe(categoryData => {
      this.createCategoryChart(
        Object.keys(categoryData),
        Object.values(categoryData)
      );
    });

    // Manufacturer Stock Chart
    this.dashboardService.getManufacturerDistribution().subscribe(manufacturerData => {
      this.createManufacturerChart(
        Object.keys(manufacturerData),
        Object.values(manufacturerData)
      );
    });

    // Stock Evolution Chart
    this.dashboardService.getStockEvolution().subscribe(stockEvolutionData => {
      this.createStockEvolutionChart(
        stockEvolutionData.map(item => item.month),
        stockEvolutionData.map(item => item.totalQuantity)
      );
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme');
  }

  calculateTrend(type: string): number {
    // Implement trend calculation logic
    switch(type) {
      case 'articles': return 5.2;
      case 'quantity': return 3.7;
      case 'lowStock': return 2.1;
      case 'expiringItems': return 1.5;
      default: return 0;
    }
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredStockData = this.stockData.filter(item => 
      item.article.toLowerCase().includes(searchTerm) ||
      item.constructeur.toLowerCase().includes(searchTerm) ||
      item.categorie.toLowerCase().includes(searchTerm)
    );
  }

  // Chart Creation Methods
  createCategoryChart(labels: string[], quantities: number[]) {
    if (this.categoryChartRef && this.categoryChartRef.nativeElement) {
      this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: quantities,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Distribution des Catégories'
            }
          }
        }
      });
    }
  }

  createManufacturerChart(labels: string[], quantities: number[]) {
    if (this.manufacturerChartRef && this.manufacturerChartRef.nativeElement) {
      this.manufacturerChart = new Chart(this.manufacturerChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Quantité en Stock',
            data: quantities,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Quantité'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Stock par Constructeur'
            }
          }
        }
      });
    }
  }

  createStockEvolutionChart(months: string[], quantities: number[]) {
    if (this.stockEvolutionChartRef && this.stockEvolutionChartRef.nativeElement) {
      this.stockEvolutionChart = new Chart(this.stockEvolutionChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Quantité Totale',
            data: quantities,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Évolution du Stock Total'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Quantité'
              }
            }
          }
        }
      });
    }
  }

  // Helper methods for data transformations
  getTotalQuantity(): number {
    return this.stockData.reduce((total, item) => total + item.quantite, 0);
  }

  getLowStockItems(): StockItem[] {
    return this.stockData.filter(item => item.quantite < 20);
  }

  getExpiringItems(): StockItem[] {
    const today = new Date();
    const threemonths = new Date();
    threemonths.setMonth(threemonths.getMonth() + 3);
    
    return this.stockData.filter(item => {
      if (item.endOfSale === 'Not announced') return false;
      const [day, month, year] = item.endOfSale.split('-');
      const endOfSale = new Date(`${month} ${day} ${year}`);
      return endOfSale <= threemonths && endOfSale >= today;
    });
  }
}