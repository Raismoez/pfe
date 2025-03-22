import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

// Enregistrer les composants Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
})
export class DashboardComponent implements OnInit {
  // Données utilisateur
  userName: string = 'Administrateur';
  
  // Période sélectionnée pour les graphiques
  selectedPeriod: string = 'week';
  
  // Cartes statistiques
  statsCards = [
    {
      title: 'Total des articles',
      value: '32',
      icon: 'fa-network-wired',
      color: '#4a6cf7'
    },
    {
      title: 'Catégories',
      value: '7',
      icon: 'fa-th-large',
      color: '#28a745'
    },
    {
      title: 'Constructeurs',
      value: '3',
      icon: 'fa-building',
      color: '#17a2b8'
    },
    {
      title: 'Alertes',
      value: '5',
      icon: 'fa-exclamation-triangle',
      color: '#ffc107'
    }
  ];
  
  // Articles en stock
  stockItems = [
    {
      id: 'NIM-4G-LTE-GA',
      name: 'NIM-4G-LTE-GA',
      category: 'Carte NIM 4G',
      constructeur: 'CISCO',
      quantity: 2,
      status: 'En stock'
    },
    {
      id: 'NIM-1GE-CU-SFP',
      name: 'NIM-1GE-CU-SFP',
      category: 'Carte NIM FO',
      constructeur: 'CISCO',
      quantity: 1,
      status: 'Stock bas'
    },
    {
      id: 'GLC-BX-D',
      name: 'GLC-BX-D',
      category: 'Module SFP',
      constructeur: 'CISCO',
      quantity: 4,
      status: 'En stock'
    },
    {
      id: 'C1117-4P',
      name: 'C1117-4P',
      category: 'Routeur',
      constructeur: 'CISCO',
      quantity: 0,
      status: 'Rupture'
    },
    {
      id: 'AR651',
      name: 'AR651',
      category: 'Routeur',
      constructeur: 'Huawei',
      quantity: 3,
      status: 'En stock'
    }
  ];
  
  // Alertes de stock bas
  lowStockAlerts = [
    {
      productId: 'NIM-1GE-CU-SFP',
      message: 'Le stock de "NIM-1GE-CU-SFP" est bas (1 unité restante)',
    },
    {
      productId: 'C1117-4P',
      message: 'Le produit "C1117-4P" est en rupture de stock',
    },
    {
      productId: 'FortiGate 80F',
      message: 'Le produit "FortiGate 80F" arrive à expiration le 30/04/2025',
    }
  ];
  
  // Graphiques
  stockChart: any;
  categoryChart: any;
  constructeurChart: any;
  statsBarChart: any;
  
  constructor() {}
  
  ngOnInit(): void {
    this.initCharts();
  }
  
  // Initialisation des graphiques
  initCharts(): void {
    setTimeout(() => {
      this.createStatsBarChart();
      this.createStockChart();
      this.createCategoryChart();
      this.createConstructeurChart();
    }, 100);
  }
  
  // Création du graphique en barres pour les statistiques
  createStatsBarChart(): void {
    const ctx = document.getElementById('statsBarChart') as HTMLCanvasElement;
    
    if (ctx) {
      // Données de mouvements de stock par mois
      const labels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];
      
      this.statsBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Entrées',
              data: [5, 8, 3, 10, 6, 4],
              backgroundColor: 'rgba(74, 108, 247, 0.7)',
              borderColor: '#4a6cf7',
              borderWidth: 1
            },
            {
              label: 'Sorties',
              data: [3, 5, 2, 7, 4, 2],
              backgroundColor: 'rgba(255, 193, 7, 0.7)',
              borderColor: '#ffc107',
              borderWidth: 1
            },
            {
              label: 'Balance',
              data: [2, 3, 1, 3, 2, 2],
              backgroundColor: 'rgba(40, 167, 69, 0.7)',
              borderColor: '#28a745', 
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Nombre d\'articles'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Mois'
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            title: {
              display: true,
              text: 'Bilan des mouvements de stock S1 2025',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            tooltip: {
              callbacks: {
                footer: (tooltipItems) => {
                  // Calculer le total pour chaque mois
                  const datasetIndex = tooltipItems[0].datasetIndex;
                  const index = tooltipItems[0].dataIndex;
                  
                  if (datasetIndex === 2) { // Pour la Balance uniquement
                    const entrees = labels[index] + ': ' + tooltipItems[0].dataset.data[index] + ' articles en solde positif';
                    return entrees;
                  }
                  return '';
                }
              }
            }
          }
        }
      });
    }
  }
  
  // Création du graphique d'évolution des stocks
  createStockChart(): void {
    const ctx = document.getElementById('stockChart') as HTMLCanvasElement;
    
    if (ctx) {
      this.stockChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
          datasets: [
            {
              label: 'Entrées',
              data: [5, 8, 3, 10, 6, 4],
              borderColor: '#4a6cf7',
              backgroundColor: 'rgba(74, 108, 247, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Sorties',
              data: [3, 5, 2, 7, 4, 2],
              borderColor: '#ffc107',
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }
  
  // Création du graphique de répartition par catégorie
  createCategoryChart(): void {
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    
    if (ctx) {
      this.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Carte NIM', 'Module SFP', 'Routeur', 'Switch', 'Jarretière optique'],
          datasets: [{
            data: [4, 6, 15, 3, 4],
            backgroundColor: [
              '#4a6cf7',
              '#28a745',
              '#17a2b8',
              '#ffc107',
              '#6c757d'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });
    }
  }
  
  // Création du graphique de répartition par constructeur
  createConstructeurChart(): void {
    const ctx = document.getElementById('constructeurChart') as HTMLCanvasElement;
    
    if (ctx) {
      this.constructeurChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['CISCO', 'Huawei', 'Fortinet'],
          datasets: [{
            data: [22, 7, 3],
            backgroundColor: [
              '#0057b8',
              '#e6002e',
              '#ee7c00'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });
    }
  }
  
  // Mise à jour des données du graphique en fonction de la période sélectionnée
  updateChartData(): void {
    // Détruire les graphiques existants
    if (this.stockChart) {
      this.stockChart.destroy();
    }
    
    // Les données et labels changent en fonction de la période
    let labels: string[] = [];
    let incomingData: number[] = [];
    let outgoingData: number[] = [];
    
    switch (this.selectedPeriod) {
      case 'day':
        labels = ['8h', '10h', '12h', '14h', '16h', '18h'];
        incomingData = [1, 3, 2, 4, 1, 0];
        outgoingData = [0, 2, 1, 3, 1, 1];
        break;
      case 'week':
        labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        incomingData = [3, 5, 2, 4, 3, 0, 0];
        outgoingData = [2, 3, 1, 2, 4, 0, 0];
        break;
      case 'month':
        labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
        incomingData = [5, 8, 3, 10, 6, 4];
        outgoingData = [3, 5, 2, 7, 4, 2];
        break;
    }
    
    // Recréer le graphique avec les nouvelles données
    const ctx = document.getElementById('stockChart') as HTMLCanvasElement;
    
    if (ctx) {
      this.stockChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Entrées',
              data: incomingData,
              borderColor: '#4a6cf7',
              backgroundColor: 'rgba(74, 108, 247, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Sorties',
              data: outgoingData,
              borderColor: '#ffc107',
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }
  
  // Méthodes pour gérer les actions utilisateur
  refreshData(): void {
    console.log('Actualisation des données...');
    // Recréer tous les graphiques pour simuler un rafraîchissement
    if (this.stockChart) {
      this.stockChart.destroy();
    }
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (this.constructeurChart) {
      this.constructeurChart.destroy();
    }
    if (this.statsBarChart) {
      this.statsBarChart.destroy();
    }
    
    this.createStatsBarChart();
    this.createStockChart();
    this.createCategoryChart();
    this.createConstructeurChart();
  }
  
  addProduct(): void {
    console.log('Ouverture du formulaire d\'ajout d\'article');
    // Ici, vous pourriez ouvrir un modal ou naviguer vers une page de formulaire
  }
  
  editProduct(product: any): void {
    console.log('Édition de l\'article:', product);
    // Ici, vous pourriez ouvrir un modal avec les données du produit
  }
  
  deleteProduct(product: any): void {
    console.log('Suppression de l\'article:', product);
    // Ici, vous pourriez afficher une confirmation puis supprimer le produit
  }
  
  orderProduct(productId: string): void {
    console.log('Commande de l\'article:', productId);
    // Ici, vous pourriez ouvrir un formulaire de commande
  }
  
  // Déterminer la classe CSS pour le statut du stock
  getStatusClass(quantity: number): string {
    if (quantity === 0) return 'status-danger';
    if (quantity <= 2) return 'status-warning';
    return 'status-success';
  }
  
  // Obtenir le texte du statut en fonction de la quantité
  getStatusText(quantity: number): string {
    if (quantity === 0) return 'Rupture';
    if (quantity <= 2) return 'Stock bas';
    return 'En stock';
  }
  
  // Obtenir l'icône de catégorie en fonction du nom de la catégorie
  getCategoryIcon(category: string): string {
    switch (category.toLowerCase()) {
      case 'module sfp':
        return 'fa-microchip';
      case 'routeur':
        return 'fa-network-wired';
      case 'switch':
        return 'fa-sitemap';
      case 'carte nim':
      case 'carte nim 4g':
      case 'carte nim fo':
      case 'carte nim fxs':
      case 'carte nim xdsl':
        return 'fa-memory';
      case 'jarretière optique':
        return 'fa-fiber-manual-record';
      default:
        return 'fa-tag';
    }
  }
  
  // Obtenir l'icône du constructeur
  getManufacturerIcon(manufacturer: string): string {
    switch (manufacturer.toLowerCase()) {
      case 'cisco':
        return 'fa-cog';
      case 'huawei':
        return 'fa-cogs';
      case 'fortinet':
        return 'fa-shield-alt';
      default:
        return 'fa-building';
    }
  }
}