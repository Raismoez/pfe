import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { RouterModule } from '@angular/router';
Chart.register(...registerables);

import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { DashboardService, StockItem } from '../services/dashboard.service';

interface StockMovement {
  month: string;
  totalQuantity: number;
}

interface ManufacturerStockHistory {
  month: string;
  quantity: number;
}

interface SummaryCard {
  title: string;
  value: number | string;
  icon: string;
  iconClass: string;
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
  imports: [CommonModule, HttpClientModule, SidebarComponent, HeaderComponent, RouterModule]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('manufacturerChart') manufacturerChartRef!: ElementRef;
  @ViewChild('stockEvolutionChart') stockEvolutionChartRef!: ElementRef;
  
  // References for Cisco article-specific chart canvases - 5 charts
  @ViewChild('C820014TChart') C820014TChartRef!: ElementRef;
  @ViewChild('C83001N1S6TChart') C83001N1S6TChartRef!: ElementRef;
  @ViewChild('C1121X8PChart') C1121X8PChartRef!: ElementRef;
  @ViewChild('C11174PChart') C11174PChartRef!: ElementRef;
  @ViewChild('C11174PWEChart') C11174PWEChartRef!: ElementRef;
  
  
  // References for Fortinet article-specific chart canvases - 3 charts
  @ViewChild('FortiGate80FChart') FortiGate80FChartRef!: ElementRef;
  @ViewChild('FortiGate80FDSLChart') FortiGate80FDSLChartRef!: ElementRef;
  @ViewChild('FortiGate80F2R3G4GDSLChart') FortiGate80F2R3G4GDSLChartRef!: ElementRef;
  
  // References for Huawei article-specific chart canvases - 3 charts
  @ViewChild('AR651Chart') AR651ChartRef!: ElementRef;
  @ViewChild('AR617VWLTEChart') AR617VWLTEChartRef!: ElementRef;
  @ViewChild('AR657WChart') AR657WChartRef!: ElementRef;

  stockData: StockItem[] = [];
  summaryCards: SummaryCard[] = [];
  
  categoryChart: Chart | null = null;
  manufacturerChart: Chart | null = null;
  stockEvolutionChart: Chart | null = null;
  
  // Article-specific charts
  articleCharts: Map<string, Chart> = new Map();
  
  // Specific article IDs we want to track - All articles are defined here
  specificArticles = {
    cisco: ['C8200-1N-4T', 'C8300-1N1S-6T','C1121X-8P', 'C1117-4P', 'C1117-4PWE'],
    fortinet: ['FortiGate 80F', 'FortiGate 80F-DSL', 'FortiGate-80F-2R-3G4G-DSL'],
    huawei: ['NetEngine AR651', 'NetEngine AR617VW-LTE', 'NetEngine AR657W']
  };
  
  // Months for displaying data
  months: string[] = ['M', 'M-2', 'M-3', 'M-4', 'M-5', 'M-6'];
  isRefreshing: boolean = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardMetrics();
    this.loadStockItems();
  }
  
  ngAfterViewInit() {
    // Chart creation is now handled after data is loaded
    this.loadChartData();
  }

  loadStockItems() {
    this.dashboardService.getStockItems().subscribe({
      next: (items) => {
        console.log('Stock Items Fetched:', items); // Debug log
        this.stockData = items;
        
        // Create article-specific evolution charts after data is loaded
        setTimeout(() => {
          this.createArticleEvolutionCharts();
        }, 500); // Small timeout to ensure DOM elements are ready
      },
      error: (error) => {
        console.error('Error fetching stock items:', error); // Error log
      },
      complete: () => {
        console.log('Stock items fetch completed'); 
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
          iconClass: 'icon-blue', 
        },
        {
          title: 'Quantité Totale',
          value: metrics.totalQuantity,
          icon: 'fas fa-cubes',
          iconClass: 'icon-green', 
        },
        {
          title: 'Stock Faible',
          value: `${metrics.lowStockItemsCount} articles`,
          icon: 'fas fa-exclamation-triangle',
          iconClass: 'icon-orange', 
        },
        {
          title: 'Fin de Vente Proche',
          value: `${metrics.expiringItemsCount} articles`,
          icon: 'fas fa-bell',
          iconClass: 'icon-red', 
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
    // Dans loadChartData()
this.dashboardService.getManufacturerDistribution().subscribe(manufacturerData => {
  const modifiedData: {[key: string]: number} = {};
  
  // Parcourir toutes les clés et regrouper les variantes de Cisco
  Object.keys(manufacturerData).forEach(key => {
    if (key.toUpperCase() === "CISCO") {
      // Si c'est une variation de "CISCO", l'ajouter à l'entrée "CISCO"
      if (!modifiedData["CISCO"]) {
        modifiedData["CISCO"] = 0;
      }
      modifiedData["CISCO"] += manufacturerData[key];
    } else {
      // Pour les autres constructeurs, conserver tels quels
      modifiedData[key] = manufacturerData[key];
    }
  });
  
  this.createManufacturerChart(
    Object.keys(modifiedData),
    Object.values(modifiedData)
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
      
      const selectedItem = this.stockData.length > 0 ? this.stockData[0] : null;
      
      let datasets = [{
        label: 'Quantité Totale',
        data: quantities,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }];
      
      this.stockEvolutionChart = new Chart(this.stockEvolutionChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: months,
          datasets: datasets
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

  // Method to create all article-specific evolution charts
  createArticleEvolutionCharts() {
    // Only continue if data is loaded
    if (!this.stockData.length) {
      console.warn('No stock data available for creating article charts');
      return;
    }
    
    console.log('Creating charts for specific articles...');
    
    // Create charts for Cisco articles - All 5 charts
    this.specificArticles.cisco.forEach(articleId => {
      console.log(`Attempting to create chart for Cisco article: ${articleId}`);
      this.createArticleChart(articleId, 'rgb(0, 122, 204)');
    });
    
    // Create charts for Fortinet articles - All 3 charts
    this.specificArticles.fortinet.forEach(articleId => {
      console.log(`Attempting to create chart for Fortinet article: ${articleId}`);
      this.createArticleChart(articleId, 'rgb(230, 0, 70)');
    });
    
    // Create charts for Huawei articles - All 3 charts
    this.specificArticles.huawei.forEach(articleId => {
      console.log(`Attempting to create chart for Huawei article: ${articleId}`);
      this.createArticleChart(articleId, 'rgb(51, 255, 51)');
    });
  }

  // Get chart reference element by article ID
  getChartRefElementByArticleId(articleId: string): ElementRef | null {
    const sanitizedId = this.sanitizeArticleIdForRef(articleId);
    console.log(`Looking for chart ref for sanitized ID: ${sanitizedId}`);
    
    // Switch statement to map article IDs to their respective chart references
    switch (sanitizedId) {
      // Cisco - 5 charts
      case 'C82001N4T': 
      case 'C820014T': return this.C820014TChartRef;
      case 'C83001N1S6T': return this.C83001N1S6TChartRef;
      case 'C1121X8P': return this.C1121X8PChartRef;
      case 'C11174P': return this.C11174PChartRef;
      case 'C11174PWE': return this.C11174PWEChartRef;
      
      
      // Fortinet - 3 charts
      case 'FortiGate80F': return this.FortiGate80FChartRef;
      case 'FortiGate80FDSL': return this.FortiGate80FDSLChartRef;
      case 'FortiGate80F2R3G4GDSL': return this.FortiGate80F2R3G4GDSLChartRef;
      
      // Huawei - 3 charts
      case 'AR651': return this.AR651ChartRef;
      case 'AR617VWLTE': 
      case 'AR617VWLTE4EA': return this.AR617VWLTEChartRef;
      case 'AR657W': return this.AR657WChartRef;
      
      default:
        console.warn(`No chart reference found for ID: ${sanitizedId} (original: ${articleId})`);
        return null;
    }
  }

  // Helper method to sanitize article ID for reference naming
  sanitizeArticleIdForRef(articleId: string): string {
    return articleId
      .replace(/NetEngine\s*/i, '') // Remove "NetEngine" prefix for Huawei
      .replace(/[\s-]/g, '') // Remove spaces and hyphens
      .replace(/4EA$/i, '') // Remove 4EA suffix for the AR617VW-LTE model
      .replace(/1N-/g, '1'); // Fix the 1N- in C8200 models
  }

  // Method to create a chart for a specific article
  createArticleChart(articleId: string, borderColor: string) {
    // Get chart reference element
    const chartRef = this.getChartRefElementByArticleId(articleId);
    if (!chartRef || !chartRef.nativeElement) {
      console.warn(`Chart reference not found for article ${articleId}`);
      return;
    }
    
    // Get article data
    const article = this.getArticleById(articleId);
    if (!article) {
      console.warn(`Article not found: ${articleId}`);
      return;
    }
    
    console.log(`Creating chart for article ${articleId}`);
    
    // Get article history data
    const historyData = this.getArticleHistoryData(article);
    
    // Create chart
    const chart = new Chart(chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.months,
        datasets: [{
          label: `Quantité ${articleId}`,
          data: historyData,
          fill: false,
          borderColor: borderColor,
          backgroundColor: `${borderColor.replace(')', ', 0.1)')}`,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Évolution du Stock - ${articleId}`
          },
          tooltip: {
            mode: 'index',
            intersect: false
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
    
    // Store chart reference
    this.articleCharts.set(articleId, chart);
    console.log(`Chart created successfully for ${articleId}`);
  }

  // Helper method to find article by ID with partial matching
  getArticleById(articleId: string): StockItem | undefined {
    // Try exact match first
    let article = this.stockData.find(item => 
      item.article.toLowerCase() === articleId.toLowerCase()
    );
    
    // If exact match fails, try partial match with more flexibility
    if (!article) {
      article = this.stockData.find(item => {
        const itemClean = item.article.toLowerCase().replace(/[-\s]/g, '');
        const searchClean = articleId.toLowerCase().replace(/[-\s]/g, '');
        return itemClean.includes(searchClean) || searchClean.includes(itemClean);
      });
    }
    
    if (!article) {
      console.warn(`Could not find article data for ${articleId}`);
    }
    
    return article;
  }

  // Helper method to get article history data
  getArticleHistoryData(article: StockItem): number[] {
    if (!article) return [0, 0, 0, 0, 0, 0];
    
    return [
      article.quantite || 0,
      article.quantiteM2 || 0,
      article.quantiteM3 || 0,
      article.quantiteM4 || 0,
      article.quantiteM5 || 0,
      article.quantiteM6 || 0
    ];
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
  
  // Analyze stock trend for reports
  analyzeStockTrend(itemId: string): { trend: 'increasing' | 'decreasing' | 'stable', percentage: number } {
    const item = this.stockData.find(i => i.article === itemId);
    if (!item) return { trend: 'stable', percentage: 0 };
    
    // Get valid quantities
    const quantities = [
      item.quantite,
      item.quantiteM2,
      item.quantiteM3,
      item.quantiteM4,
      item.quantiteM5,
      item.quantiteM6
    ].filter(q => q !== undefined && q !== null) as number[];
    
    if (quantities.length < 2) return { trend: 'stable', percentage: 0 };
    
    // Calculate trend
    const oldest = quantities[quantities.length - 1];
    const newest = quantities[0];
    const diff = newest - oldest;
    const percentage = Math.round((diff / oldest) * 100);
    
    if (percentage > 5) return { trend: 'increasing', percentage };
    if (percentage < -5) return { trend: 'decreasing', percentage: Math.abs(percentage) };
    return { trend: 'stable', percentage: 0 };
  }


// Méthode pour rafraîchir le tableau de bord
refreshDashboard() {
  if (this.isRefreshing) return;
  
  this.isRefreshing = true;
  const refreshBtn = document.querySelector('.refresh-btn');
  if (refreshBtn) {
    refreshBtn.classList.add('loading');
  }
  
  // Réinitialisation des données
  this.stockData = [];
  this.summaryCards = [];
  
  // Destruction des graphiques existants pour éviter les doublons
  this.destroyAllCharts();
  
  // Rechargement des données
  this.loadDashboardMetrics();
  this.loadStockItems();
  
  // Rechargement des données des graphiques
  this.loadChartData();
  
  // Simuler un délai pour montrer le chargement (facultatif)
  setTimeout(() => {
    this.isRefreshing = false;
    if (refreshBtn) {
      refreshBtn.classList.remove('loading');
    }
  }, 1500);
}

// Méthode pour détruire tous les graphiques existants
destroyAllCharts() {
  // Détruire les graphiques principaux
  if (this.categoryChart) {
    this.categoryChart.destroy();
    this.categoryChart = null;
  }
  
  if (this.manufacturerChart) {
    this.manufacturerChart.destroy();
    this.manufacturerChart = null;
  }
  
  if (this.stockEvolutionChart) {
    this.stockEvolutionChart.destroy();
    this.stockEvolutionChart = null;
  }
  
  // Détruire les graphiques spécifiques aux articles
  this.articleCharts.forEach((chart) => {
    chart.destroy();
  });
  this.articleCharts.clear();
}
}